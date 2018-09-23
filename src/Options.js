import FormData from 'form-data';
import { getQueryParameters } from './utils';
import config from '../config/config';

export class Options {
	constructor(request, baseURL, headers) {
		this.setRequest(request);
		this.setBaseURL(baseURL);
		this._globalHeaders = headers;
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

  getOptions() {
    return {
      method: this.getMethod(),
      url: this.getUrl(this.request.url),
      headers: this.getHeaders(this.request.headers),
      body: this.getBody(this.request.body),
    };
  }

  getUrl() {
    const queryParams = this._isBodyNotAllowed(this.getMethod()) ? getQueryParameters(this.request.body) : '';
    return this.getRequestUrl() + queryParams;
  }
  getRequestUrl() {
    if (this.request.url.indexOf('https://') !== -1 || this.request.url.indexOf('http://') !== -1) {
      return this.request.url;
    }
    let baseURL = this.baseURL || '';
    return baseURL + this.request.url;
  }

	getHeaders() {
		return {...this._globalHeaders, ...this.request.headers} || {};
	}

  getBody() {
    if (this.request.body instanceof FormData) {
      return this.request.body;
    }
    if (this._isBodyNotAllowed(this.request.method)) {
      return null;
    }
    return JSON.stringify(this.request.body);
  }

  getMethod() {
    // Only methods from the RFC 2616 specification are allowed
    if (config.method[this.request.method]) {
      return config.method[this.request.method];
    }
    else {
      throw new Error(`Invalid method ${this.request.method}`);
    }
  }

  _isBodyNotAllowed(method) {
    const lowerCaseMethod = method.toLowerCase();
    return lowerCaseMethod === 'get' || lowerCaseMethod === 'head';
  }
}
