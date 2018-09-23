import { copyObject } from 'rest-api-helper/src/utils';
import { Logger } from './api-hepler-logger';
import config from '../config/config';
import { Options } from './Options';
import { RequestError } from './RequestError';
import { Request } from './Requst';

export class RestApiHelper {

	static _config = {};

	static configure(config) {
		RestApiHelper._config = config;
		Logger.setOption(config.logger);
		Logger.log('ApiHelper/CONFIGURATION', {config});
	}

	static build(url) {
		if (url) {
			try {
				return new Request(copyObject(RestApiHelper._config.request[url]));
			}
			catch (e) {
				throw new Error(e);
			}
		}
		else throw new Error('You should specify url')
	}

	static async fetch(request) {
		let requestBody = {};
		let requestHeaders = {};

		const config = typeof request === 'object' ? request._config : RestApiHelper._config.request[request];
		const options = new Options(config, RestApiHelper._config.baseURL, RestApiHelper._config.headers);

		try {
			Logger.log(`ApiHelper/FETCH (${options.getUrl()}): `, {
				'url': options.getUrl(),
				...options.getOptions(),
			});

			const response = await fetch(options.getUrl(), options.getOptions());

			Logger.log('ApiHelper/COMPLETE:', {'response': response}, 'blue');

			if (response.headers) {
				if (response.headers.map) {
					requestHeaders = response.headers.map;
				}
				else {
					requestHeaders = response.headers;
				}
			}

			try {
				requestBody = await response.json();

				Logger.log(
					'ApiHelper/PARSE:', {
						'status': response.status,
						'body': requestBody,
						'headers': requestHeaders,
					}, 'green');
			}
			catch (error) {
				// that's okay. If status 400, for example, response.json() crashes, but that's okay :) Do nothing
			}
			return RestApiHelper._decorate({
				status: response.status,
				body: requestBody,
				headers: requestHeaders,
			});
		}
		catch (error) {
			throw error;
		}
	}

	static _decorate(response) {
		if (RestApiHelper._isSuccess(response.status)) {
			return {
				'body': response.body,
				'headers': response.headers,
			};
		}
		else {
			Logger.log(`ApiHelper/ERROR:`, {
				'status': `${response.status} ${RestApiHelper._config.statusDescription[response.status]
				|| config.status[response.status]}`,
			}, 'red');

			throw new RequestError(
				`${response.status}`,
				`${RestApiHelper._config.statusDescription[response.status] || config.status[response.status]}`,
				JSON.stringify(response.body),
			);
		}
	}

	static _isSuccess(status) {
		return RestApiHelper._config.successStatus.indexOf(status) !== -1;
	}
}
