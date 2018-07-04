import "isomorphic-fetch";
import { Logger } from './api-hepler-logger';
import config from '../config/config';

export class RestApiHelper {

	/**
	 * User's config.json
	 * Required property baseURL
	 * Required property headers. Set it as {} and redefine before call fetch()
	 * Run RestApiHelper.configure(require(<your_config.json>)) to initialize controller
	 * @param config
	 */
	static _config = {};

	static configure(config) {
		RestApiHelper._config = config;
		Logger.setOption(RestApiHelper._config.logger);

		Logger.log('ApiHelper/CONFIGURATION', { 'config': RestApiHelper._config });
	}

	static async fetch(method, url = '', body = {}) {
		let requestBody = {};
		try {
			Logger.log('ApiHelper/RUN: ', {
					'url': RestApiHelper._getUrl(url),
					...RestApiHelper._getOptions(method, body),
					'body': body
				}
			);
			const response = await fetch(RestApiHelper._getUrl(url), RestApiHelper._getOptions(method, body));
			Logger.log('ApiHelper/COMPLETE:', { 'response': response }, 'blue');

			try {
				requestBody = await response.json();
				Logger.log('ApiHelper/PARSE:', { 'status': response.status, 'body': requestBody }, 'green');
			}
			catch ( e ) {
				// that's okay. If status 400, for example, response.json() crashes, but that's okay :) Do nothing
			}
			return RestApiHelper._decorate({ status: response.status, body: requestBody });
		}
		catch ( e ) {
			throw e;
		}
	}

	static _decorate(response) {
		if ( RestApiHelper._isSuccess(response.status) ) {
			return response.body;
		}
		else {
			Logger.log(`ApiHelper/ERROR:`, {
				'status': `${response.status} ${RestApiHelper._config.statusDescription[response.status] || config.status[response.status]}`
			}, 'red');

			throw new RequestError(
				`${response.status}`,
				`${RestApiHelper._config.statusDescription[response.status] || config.status[response.status]}`,
				JSON.stringify(response.body)
			);
		}
	}

	static _isSuccess(status) {
		return RestApiHelper._config.successStatus.indexOf(status) !== -1;
	}

	/**
	 * Only methods from the RFC 2616 specification are allowed
	 */
	static _getMethod(method) {
		if ( config.method[method] ) {
			return config.method[method];
		}
		else {
			throw new Error('Invalid method');
		}
	}

	static _getBody(method, body) {
		if ( body instanceof FormData ) {
			return body;
		}
		if ( RestApiHelper._isBodyNotAllowed(method) ) {
			return null;
		}
		else {
			return JSON.stringify(body);
		}
	}

	static _isBodyNotAllowed(method) {
		return method === 'get' || method === 'GET' || method === 'head' || method === 'HEAD'
	}

	static _getHeaders() {
		return RestApiHelper._config.headers || {}
	}

	static _getUrl(url) {

		if ( url.indexOf('https://') !== -1 || url.indexOf('http://') !== -1 ) {
			return url;
		}

		let baseURL = RestApiHelper._config.baseURL || '';
		return baseURL + url
	}

	static _getOptions(method, body) {
		return {
			method: RestApiHelper._getMethod(method),
			headers: RestApiHelper._getHeaders(),
			body: RestApiHelper._getBody(method, body)
		}
	}
}
