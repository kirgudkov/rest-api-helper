import "isomorphic-fetch";
import { Logger } from './Logger';

const config = require('../config/config');

export class RestApiHelper {

	/**
	 * User's config.json
	 * Required property baseURL
	 * Required property headers. Set it as {} and redefine before call _fetch()
	 * Run RestApiHelper.configure(require(<your_config.json>)) to initialize controller
	 * @param config
	 */
	static _config = {};

	static configure(config) {
		RestApiHelper._config = config;
		Logger.setOption(RestApiHelper._config.logger);

		Logger.log('RestApiHelper has been configured', Logger.style.bold, JSON.parse(RestApiHelper._config));
	}

	static async _fetch(method, url = '', body = {}) {
		try {

			Logger.log('_fetch is starting with: ', Logger.style.bold, {
				url: RestApiHelper._getUrl(url),
				...RestApiHelper._getOptions(method, body)
			});

			const response = await fetch(RestApiHelper._getUrl(url), RestApiHelper._getOptions(method, body));
			const json = await response.json();

			Logger.log('Request was successfully done with status:', Logger.style.bold, response.status, json);

			return RestApiHelper._decorate({ status: response.status, json: json });
		}
		catch ( e ) {
			throw e;
		}
	}

	static _decorate(response) {
		if ( RestApiHelper._isSuccess(response.status) ) {
			return response.json;
		}
		else {
			Logger.log(`Request was successfully done, but status don't belong to yours success list`, Logger.style.red + ',' + Logger.style.bold);
			throw new Error(RestApiHelper._config.status[response.status] || config.statusDescription[response.status]);
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
		if ( method === 'get' || method === 'GET' || method === 'head' || method === 'HEAD' ) {
			return null;
		}
		else {
			return JSON.stringify(body);
		}
	}

	static _getHeaders() {
		return RestApiHelper._config.headers || {}
	}

	static _getUrl(url) {
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