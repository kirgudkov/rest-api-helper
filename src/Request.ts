import { URL } from "./URL";

class Request {
  public static readonly DEFAULT_PROTOCOL = "http";
  public static readonly DEFAULT_HOST = "host.com";

  public readonly method: string;
  public readonly headers: Record<string, string> = {};
  public readonly url = new URL(`${Request.DEFAULT_PROTOCOL}://${Request.DEFAULT_HOST}`);

  public isInterceptionAllowed = true;
  public body: BodyInit | null = null;

  private signal: AbortSignal | null = null;

  constructor(path: string, method: string) {
    this.url.pathname = path;
    this.method = method;
  }

  setBaseURL(url: string) {
    const [protocol, host] = url.split("://");

    this.url.protocol = protocol;
    this.url.host = host;

    return this;
  };

  setHeader(key: string, value: string) {
    this.headers[key.toLowerCase()] = value;

    return this;
  };

  removeHeader(key: string) {
    if (this.headers[key.toLowerCase()]) {
      delete this.headers[key.toLowerCase()];
    }

    return this;
  };

  setDefaultHeaders(headers: Record<string, string>) {
    Object.keys(headers).forEach(rawKey => {
      const formattedKey = rawKey.toLowerCase();

      if (!this.headers[formattedKey]) {
        this.headers[formattedKey] = headers[rawKey];
      }
    });

    return this;
  };

  setHeaders(headers: Record<string, string>) {
    Object.keys(headers).forEach(rawKey => {
      const formattedKey = rawKey.toLowerCase();
      this.headers[formattedKey] = headers[rawKey];
    });

    return this;
  };

  setBody(data: BodyInit): Request {
    this.body = data;

    return this;
  }

  setUrlParam(key: string, value: string | number) {
    this.url.pathname = this.url.pathname.replace(`:${key}`, value.toString());

    return this;
  };

  setInterceptionAllowed(allowed: boolean) {
    this.isInterceptionAllowed = allowed;

    return this;
  }

  setAbortController(abortController: AbortController) {
    this.signal = abortController.signal;

    return this;
  }

  setSearchParam(key: string, value: string | number | boolean | Array<string | number | boolean>) {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        this.url.searchParams.append(key, item.toString());
      });

      return this;
    }

    this.url.searchParams.append(key, value.toString());

    return this;
  };

  setSearchParams(params: Record<string, string | number | boolean | Array<string | number | boolean>>) {
    Object.keys(params).forEach(key => {
      const value = params[key];

      if (Array.isArray(value)) {
        value.forEach((item) => {
          this.url.searchParams.append(key, item.toString());
        });

        return;
      }

      this.url.searchParams.append(key, value.toString());
    });

    return this;
  }
}

export { Request };
