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

  static makeRequest(method, url) {
    const request = new Request({
      url,
      method,
      headers: {}
    }, url);

    request.options = new Options(request._config, RestApiHelper._config.baseURL, RestApiHelper._config.headers);

    return request
  }

  static post(url) {
    return RestApiHelper.makeRequest('post', url);
  }

  static get(url) {
    return RestApiHelper.makeRequest('get', url);
  }

  static put(url) {
    return RestApiHelper.makeRequest('put', url);
  }

  static delete(url) {
    return RestApiHelper.makeRequest('delete', url);
  }

  static head(url) {
    return RestApiHelper.makeRequest('head', url);
  }

  static patch(url) {
    return RestApiHelper.makeRequest('patch', url);
  }

  static options(url) {
    return RestApiHelper.makeRequest('options', url);
  }

  static trace(url) {
    return RestApiHelper.makeRequest('trace', url);
  }

  static connect(url) {
    return RestApiHelper.makeRequest('connect', url);
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
    const tag = generateTag(6);
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

      return RestApiHelper._decorate(response, {
        status: response.status,
        body: responseBody,
        headers: responseHeaders,
      }, request.isInterceptionEnabled, options.getRelativeUrl(), tag, request);
    } catch (error) {
      throw error;
    }
  }

  static _decorate(response, parsed, isInterceptionEnabled, requestName, tag, request) {
    if (RestApiHelper._isSuccess(parsed.status)) {
      Logger.success(fillString(`Complete ${requestName}`), {
        response,
        parsed,
      }, 'green', tag);

      return parsed;
    }

    if (RestApiHelper.interceptor && isInterceptionEnabled) {
      if (RestApiHelper.interceptor.statuses.indexOf(parsed.status) !== -1) {
        Logger.info(fillString(`→ Intercepted: ${request._config.url}`), { response, parsed }, undefined, tag)

        if (RestApiHelper.interceptor.delegate) {
          if (RestApiHelper.interceptor.delegate.onIntercept) {
            if (typeof RestApiHelper.interceptor.delegate.onIntercept !== 'function') {
              console.error('Seems like onIntercept is not a function')
            } else {
              return new Promise((resolve, reject) => {
                RestApiHelper.interceptor.delegate.onIntercept(request, resolve, reject, parsed)
              })
            }
          } else {
            console.error(`onIntercept is undefined. Seems like you haven't implemented OnInterceptDelegate interface`)
          }
        } else {
          if (RestApiHelper.interceptor.onIntercept) {
            if (typeof RestApiHelper.interceptor.onIntercept !== 'function') {
              console.error('Seems like onIntercept is not a function')
            } else {
              return new Promise((resolve, reject) => {
                RestApiHelper.interceptor.onIntercept(request, resolve, reject, parsed)
              })
            }
          } else {
            console.error(`onIntercept is undefined. Seems like you haven't implemented OnInterceptDelegate interface`)
          }
        }
      }
    }

    Logger.error(fillString(`Fail[${parsed.status}] ${requestName}`), {
      response,
      parsed,
    }, 'red', tag);

    throw new RequestError(`${response.status}`, `${RestApiHelper._config.statusDescription[response.status] || RFC.status[response.status]}`, JSON.stringify(parsed.body), JSON.stringify(parsed.headers));
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
