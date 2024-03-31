import { URL } from "./URL";

class Request {

  readonly method: string;
  readonly headers: Record<string, string> = {};
  readonly url = new URL();

  #isInterceptionAllowed = true;
  get isInterceptionAllowed() {
    return this.#isInterceptionAllowed;
  }

  #body: BodyInit | null = null;
  get body() {
    return this.#body;
  }

  #signal: AbortSignal | null = null;

  constructor(path: string, method: string) {
    this.url.pathname = path;
    this.method = method.toLowerCase();
  }

  setBaseURL(url: string) {
    const [protocol, host] = url.split("://");

    this.url.protocol = protocol;
    this.url.host = host;

    return this;
  };

  setHeaders(headers: Record<string, string>) {
    Object.keys(headers).forEach(rawKey => {
      const formattedKey = rawKey.toLowerCase();
      this.headers[formattedKey] = headers[rawKey];
    });

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

  setBody(data: BodyInit) {
    this.#body = data;

    return this;
  }

  setBodyJSON(data: Record<string, unknown> | Record<string, unknown>[]) {
    try {
      this.#body = JSON.stringify(data);
    }
    catch (error) {
      throw new Error("Request: failed to stringify the body");
    }

    return this;
  }

  setUrlParam(key: string, value: string | number) {
    this.url.pathname = this.url.pathname.replace(`:${key}`, value.toString());

    return this;
  };

  setInterceptionAllowed(allowed: boolean) {
    this.#isInterceptionAllowed = allowed;

    return this;
  }

  setAbortController(abortController: AbortController) {
    this.#signal = abortController.signal;

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

class Get extends Request {
  constructor(path: string) {
    super(path, "get");
  }
}

class Post extends Request {
  constructor(path: string) {
    super(path, "post");
  }
}

class Put extends Request {
  constructor(path: string) {
    super(path, "put");
  }
}

class Delete extends Request {
  constructor(path: string) {
    super(path, "delete");
  }
}

class Patch extends Request {
  constructor(path: string) {
    super(path, "patch");
  }
}

class Head extends Request {
  constructor(path: string) {
    super(path, "head");
  }
}

export { Request, Get, Post, Put, Delete, Patch, Head };
