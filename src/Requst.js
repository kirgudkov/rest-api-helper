import FormData from 'form-data';
import { RestApiHelper } from 'rest-api-helper/src/RestApiHelper';

export class Request {
	constructor(config) {
		this._config = config;
	}

	withHeaders(headers) {
		this._config.headers = {
			...this._config.headers,
			...headers,
		};
		return this;
	}

	withBody(body) {
		if (body instanceof FormData || Array.isArray(body)) {
			this._config.body = body;
		}
		else {
			this._config.body = {
				...this._config.body,
				...body,
			};
		}
		return this;
	}

	withParam(name, value) {
		const {url} = this._config;
		if (url.search(`{${name}}`) !== -1) {
			this._config.url = url.replace(`{${name}}`, `${value}`);
		}
		else {
			throw new Error(`param '{${name}}' does not declared in ${url}`);
		}
		return this;
	}

	async fetch() {
		return RestApiHelper.fetch(this);
	}
}
