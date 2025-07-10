import { Request } from "./Request";
import { TimeoutError } from "./TimeoutError";

class Client<T> {

  #transport: Transport<T>;
  #interceptors: Interceptor<T>[] = [];

  #baseURL: string;
  get baseURL() {
    return this.#baseURL;
  }

  set baseURL(value) {
    this.#baseURL = value;
  }

  #defaultHeaders: Record<string, string> = {};
  get defaultHeaders() {
    return this.#defaultHeaders;
  }

  set defaultHeaders(value) {
    this.#defaultHeaders = value;
  }

  constructor(transport: Transport<T>, baseURL: string) {
    this.#transport = transport;
    this.#baseURL = baseURL;
  }

  setDefaultHeaders(headers: Record<string, string>) {
    this.#defaultHeaders = headers;
    return this;
  }

  setInterceptor(interceptor: Interceptor<T>) {
    this.#interceptors.push(interceptor);
    return this;
  }

  async perform(request: Request) {
    request.setBaseURL(this.#baseURL);
    request.setDefaultHeaders(this.#defaultHeaders);

    let response = await request
      .prepare()
      .then(async _ => {
        if (request.isInterceptionAllowed) {
          for (const interceptor of this.#interceptors) {
            request = await interceptor.onRequest(request, this);
          }
        }

        if (request.timeout) {
          let timeout: NodeJS.Timeout | undefined;

          const timeoutPromise = new Promise<never>((_, reject) => {
            timeout = setTimeout(() => reject(new TimeoutError()), request.timeout);
          });

          request.signal?.addEventListener("abort", () => {
            clearTimeout(timeout);
          }, { once: true });

          const response = await Promise.race([
            this.#transport.perform(request),
            timeoutPromise,
          ]);

          clearTimeout(timeout);
          return response;
        }

        return this.#transport.perform(request);
      });

    if (!request.isInterceptionAllowed) {
      return response;
    }

    for (const interceptor of this.#interceptors) {
      response = await interceptor.onResponse(request, response, this);
    }

    return response;
  };
}

interface Transport<Response> {
  perform(request: Request): Promise<Response>;
}

interface Interceptor<Response> {
  onRequest(request: Request, client: Client<Response>): Promise<Request>;
  onResponse(request: Request, response: Response, client: Client<Response>): Promise<Response>;
}

export type { Interceptor, Transport };
export { Client };
