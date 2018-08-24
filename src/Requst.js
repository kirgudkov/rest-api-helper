import FormData from 'form-data';
import { RestApiHelper } from 'rest-api-helper/src/RestApiHelper';

export class Request {
  constructor(config) {
    this._config = config;
  }

  setHeaders(headers) {
    this._config.headers = {
      ...this._config.headers,
      ...headers,
    };
    return this;
  }

  setBody(body) {
    if (body instanceof FormData) {
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

  setIdParam(id) {
    let { url } = this._config;
    if (url.search('{id}') !== -1) {
      this._config.url = url.replace('{id}', `${id}`);
    }
    else {
      throw new Error(`param 'id' does not declared in ${url}`);
    }
  }

  async fetch() {
    return RestApiHelper.fetch(this);
  }
}
