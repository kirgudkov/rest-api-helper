const config = require('../config/config');

export class RestApiHelper {

	/**
	 * User config.json
	 * Required property baseURL
	 * Required property headers. Set it as {} and redefine before call _fetch()
	 * Run RestApiHelper.configure(require(<your_config.json>)) to initialize controller
	 * @param config
	 */
	static _config: JSON;

	static configure(config) {
		RestApiHelper._config = config;
	}

	static _decorate(response) {
		if ( RestApiHelper._isSuccess(response.status) ) {
			return response.json;
		}
		else {
			throw new Error(RestApiHelper._config.status[response.status] || config.statusDescription[response.status]);
		}
	}

	static async _fetch(method, url = '', body = {}) {
		try {
			const response = await fetch(RestApiHelper._config.baseURL + url, {
				method: RestApiHelper._getMethod(method),
				headers: RestApiHelper._config.headers,
				body: RestApiHelper._getBody(method, body)
			});
			const json = await response.json();

			return RestApiHelper._decorate({ status: response.status, json: json });
		}
		catch ( e ) {
			throw e;
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
}