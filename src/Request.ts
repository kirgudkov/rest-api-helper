class Request {
  public static readonly DEFAULT_PROTOCOL = "http:";
  public static readonly DEFAULT_HOST = "host.com";

  public readonly method: string;
  public readonly headers: Record<string, string> = {};
  public readonly url = new URL(`${Request.DEFAULT_PROTOCOL}//${Request.DEFAULT_HOST}`);

  public body: BodyInit | null = null;

  constructor(path: string, method: string) {
    this.url.pathname = path;
    this.method = method;
  }

  public setBaseURL = (url: string) => {
    const [protocol, host] = url.split("://");

    this.url.protocol = protocol;
    this.url.host = host;

    return this;
  };

  public setHeader = (key: string, value: string) => {
    this.headers[key.toLowerCase()] = value;

    return this;
  };

  public removeHeader = (key: string) => {
    if (this.headers[key.toLowerCase()]) {
      delete this.headers[key.toLowerCase()];
    }

    return this;
  };

  public setDefaultHeaders = (headers: Record<string, string>) => {
    Object.keys(headers).forEach(item => {
      const key = item.toLowerCase();

      if (!this.headers[key]) {
        this.headers[key] = headers[key];
      }
    });

    return this;
  };

  public setHeaders = (headers: Record<string, string>) => {
    Object.keys(headers).forEach(item => {
      const key = item.toLowerCase();
      this.headers[key] = headers[key];
    });

    return this;
  };

  public setBody(data: BodyInit): Request {
    this.body = data;

    return this;
  }

  public setUrlParam = (key: string, value: string | number) => {
    this.url.pathname = this.url.pathname.replace(`:${key}`, value.toString());

    return this;
  };

  public setSearchParam = (key: string, value: string | number | boolean | Array<string | number | boolean>) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        this.url.searchParams.append(key, item.toString());
      });

      return this;
    }

    this.url.searchParams.append(key, value.toString());

    return this;
  };
}

export { Request };
