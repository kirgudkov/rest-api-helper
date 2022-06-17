import FormData from 'form-data';
import { getQueryParameters, getFormURLEncodedBody, isBodyNotAllowed } from './utils';
import RFC from '../config/config';

export class Options {
	constructor(request, baseURL, headers) {
		if(!request.headers) {
			request.headers = {}
		}
		this.setRequest(request);
		this.setBaseURL(baseURL);
		this._globalHeaders = headers;
	}

	get url() {
		return this.getUrl()
	}

	setRequest(request) {
		if (request.method === '') {
			throw new Error(`Method can't be empty string`);
		}
		else if (typeof request.headers !== 'object') {
			throw new Error(`Headers should be an Object`);
		}
		else if (Array.isArray(request.headers)) {
			throw new Error(`Headers should be an Object`);
		}
		else {
			this.request = request;
		}
	}

	setBaseURL(url) {
		this.baseURL = url;
	}

	getRelativeUrl() {
		return this.request.url;
	}

	getOptions() {
		return {
			method: this.getMethod(),
			url: this.getUrl(this.request.url),
			headers: this.getHeaders(this.request.headers),
			body: this.getBody(this.request.body),
			signal: this.request.controller?.signal
		};
	}

	getUrl() {
		const oldParams = isBodyNotAllowed(this.getMethod()) ? this.request.body : {};
		const queryParams = { ...oldParams, ...(this.request.queryParams || {})};
		const paramsUrl = Object.keys(queryParams).length > 0 ? getQueryParameters(queryParams) : '';
		return this.getRequestUrl() + paramsUrl;
	}

	getRequestUrl() {
		if (this.request.url.indexOf('https://') !== -1 || this.request.url.indexOf('http://') !== -1) {
			return this.request.url;
		}
		const baseURL = this.baseURL || '';
		return baseURL + this.request.url;
	}

	getHeaders() {
		return {...this._globalHeaders, ...this.request.headers} || {};
	}

	getBody() {
		if (isBodyNotAllowed(this.request.method)) {
			return null;
		}

		if (this._isFormURLEncoded()) {
			return getFormURLEncodedBody(this.request.body);
		}

		if (this.request.body instanceof FormData) {
			return this.request.body;
		}

		if (typeof this.request.body === "string") {
			return this.request.body;
		}

		if (!this.request.body) {
			this.request.body = {};
		}

		return JSON.stringify(this.request.body);
	}

	getMethod() {
		// Only methods from the RFC 2616 specification are allowed
		if (RFC.method[this.request.method]) {
			return RFC.method[this.request.method];
		}
		else {
			throw new Error(`Invalid method ${this.request.method}`);
		}
	}

	_isFormURLEncoded() {
		let isFormUrlEncoded = false;
		const headers = this.getHeaders();
		Object.keys(headers).map(header => {
			if (headers[header].toLowerCase() === 'application/x-www-form-urlencoded') {
				isFormUrlEncoded = true;
			}
		});

		return isFormUrlEncoded;
	}
}
