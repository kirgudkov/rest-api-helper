import { Request } from "./Request";

class Client<T> {

  #baseURL: string;
  get baseURL() {
    return this.#baseURL;
  }
  set baseURL(value) {
    this.#baseURL = value;
  }

  #defaultHeaders: Record<string, string>;
  get defaultHeaders() {
    return this.#defaultHeaders;
  }
  set defaultHeaders(value) {
    this.#defaultHeaders = value;
  }

  #transport?: Transport<T>;
  #interceptors: Interceptor<T>[] = [];

  constructor(baseURL: string) {
    this.#baseURL = baseURL;
    this.#defaultHeaders = {};
  }

  setTransport(transport: Transport<T>) {
    this.#transport = transport;

    return this;
  }

  setDefaultHeaders(headers: Record<string, string>) {
    this.#defaultHeaders = headers;

    return this;
  }

  setInterceptor(interceptor: Interceptor<T>) {
    this.#interceptors.push(interceptor);

    return this;
  }

  perform(request: Request) {
    request.setBaseURL(this.#baseURL);
    request.setDefaultHeaders(this.#defaultHeaders);

    return new Promise<T>(async (resolve, reject) => {
      if (!this.#transport) {
        reject("Transport is not defined");
        return;
      }

      try {
        const response = await this.#transport.handle(request);

        if (!request.isInterceptionAllowed) {
          resolve(response);
          return;
        }

        this.#interceptors.forEach(interceptor =>
          interceptor.onResponse(request, response, { resolve, reject })
        );
      }
      catch (error) {
        reject(error);
      }
    });
  };
}

interface Transport<Response> {
  handle(request: Request): Promise<Response>;
}

type OriginalPromise<T> = {
  resolve: (value: T) => void, reject: (reason?: unknown) => void
};

interface Interceptor<Response> {
  onResponse(request: Request, response: Response, promise: OriginalPromise<Response>): Promise<void>;
}

export type { Interceptor, Transport };
export { Client };
