import FormData from 'form-data';
import { isBodyNotAllowed } from './utils';
import { RestApiHelper } from './RestApiHelper';

export class Request {
	isInterceptionEnabled = true;

	constructor(config, name) {
		this._config = config;
		this.requestName = name;
	}

	withHeaders(headers) {
		this._config.headers = {
			...this._config.headers,
			...headers,
		};
		return this;
	}

	withBody(body) {
		if (isBodyNotAllowed(this._config.method)) {
			console.warn('RestApiHelper: Body for GET and HEAD queries is deprecated. Use "withQueryParams" instead');
		}
		if (typeof body === "string") {
			this._config.body = body
		}
		else if (body instanceof FormData || Array.isArray(body)) {
			this._config.body = body;
		}
		else if (typeof body === "object") {
			this._config.body = {
				...this._config.body,
				...body,
			};
		}
		return this;
	}

	withQueryParams(params) {
		this._config.queryParams = {
			...(this._config.queryParams || {}),
			...params,
		};
		return this;
	}

	withParam(name, value) {
		return this.withUrlParam(name, value);
	}

	withUrlParam(name, value) {
		const {url} = this._config;
		if (url.search(`{${name}}`) !== -1) {
			this._config.url = url.replace(`{${name}}`, `${value}`);
		}
		else {
			throw new Error(`param '{${name}}' does not declared in ${url}`);
		}
		return this;
	}

	withAbortController(controller) {
		this._config.controller = controller
		return this
	}

	shouldBeIntercepted(value = true) {
		this.isInterceptionEnabled = value;
		return this;
	}

	async fetch() {
		return RestApiHelper.fetch(this);
	}
}
