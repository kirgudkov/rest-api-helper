import { Logger } from './api-hepler-logger';
import RFC from '../config/config';
import { Options } from './Options';
import { RequestError } from './RequestError';
import { Request } from './Request';
import { isApplicationJson, isTextPlain, copyObject, generateTag, fillString } from './utils';

export class RestApiHelper {
	static _config = {};

	static interceptor;

	static configure(config) {
		RestApiHelper._config = config;
		Logger.setOption(config.logger);
		Logger.info('Init helper', {config});
	}

	static build(url) {
		if (url) {
			try {
				return new Request(copyObject(RestApiHelper._config.request[url]), url);
			} catch (e) {
				throw new Error(e);
			}
		} else {
			throw new Error('You should specify url');
		}
	}

	static builder() {
		return RestApiHelper;
	}

	static withConfig(config) {
		RestApiHelper._config = config;
		Logger.setOption(config.logger);
		Logger.info('Init helper', {config});
		return RestApiHelper;
	}

	static withInterceptor(interceptor) {
		RestApiHelper.interceptor = interceptor;
		return RestApiHelper;
	}

	static async fetch(request) {
		let tag = generateTag(6);
		let responseBody = {};
		let responseHeaders = {};

		const config = typeof request === 'object' ? request._config : RestApiHelper._config.request[request];
		const options = new Options(config, RestApiHelper._config.baseURL, RestApiHelper._config.headers);

		try {
			Logger.info(fillString(`${options.getMethod()} ${options.getRelativeUrl()}`), {url: options.getUrl(), ...options.getOptions()}, undefined, tag);
			const response = await fetch(options.getUrl(), options.getOptions());

			responseHeaders = RestApiHelper._parseHeaders(response);

			try {
				if (isTextPlain(responseHeaders)) {
					responseBody = await response.text();
				} else if (isApplicationJson(responseHeaders)) {
					responseBody = await response.json();
				} else {
					responseBody = await response.formData();
				}
			} catch (error) {
				/* that's okay. If status 400, for example, it crashes, but that's okay :) Do nothing */
			}

			return RestApiHelper._decorate(response,{
				status: response.status,
				body: responseBody,
				headers: responseHeaders,
			}, request.isInterceptionEnabled, options.getRelativeUrl(), tag);
		} catch (error) {
			throw error;
		}
	}

	static _decorate(response, parsed, isInterceptionEnabled, requestName, tag) {
		if (RestApiHelper.interceptor && isInterceptionEnabled) {
			RestApiHelper.interceptor.delegate(parsed);
		}

		if (RestApiHelper._isSuccess(parsed.status)) {
			Logger.success(fillString(`Complete ${requestName}`), {
				response,
				parsed,
			}, 'green', tag);
			return parsed;
		}
		Logger.error(fillString(`Fail[${parsed.status}] ${requestName}`), {
			response,
			parsed,
		}, 'red', tag);
		throw new RequestError(`${response.status}`, `${RestApiHelper._config.statusDescription[response.status] || RFC.status[response.status]}`, JSON.stringify(response.body));
	}

	static _isSuccess(status) {
		return RestApiHelper._config.successStatus.indexOf(status) !== -1;
	}

	static _parseHeaders(response) {
		if (response) {
			if (response.headers) {
				if (response.headers.map) {
					return response.headers.map;
				} else {
					return response.headers;
				}
			} else {
				return {};
			}
		}
	}
}
