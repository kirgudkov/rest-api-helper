import { Request } from "./Request";

class Client<Response> {

  public url: string;
  public defaultHeaders: Record<string, string> = {};

  private transport?: Transport<Response>;
  private readonly interceptors: Interceptor<Response>[] = [];

  constructor(url: string, transport?: Transport<Response>) {
    this.url = url;
    this.transport = transport;
  }

  public setTransport(transport: Transport<Response>) {
    this.transport = transport;

    return this;
  }

  public setDefaultHeaders(headers: Record<string, string>) {
    this.defaultHeaders = headers;

    return this;
  }

  public setInterceptor(interceptor: Interceptor<Response>) {
    this.interceptors.push(interceptor);

    return this;
  }

  public perform(request: Request) {
    request.setBaseURL(this.url);
    request.setDefaultHeaders(this.defaultHeaders);

    return new Promise<Response>(async (resolve, reject) => {
      if (!this.transport) {
        reject("Transport is not defined");
        return;
      }

      const response = await this.transport.handle(request);

      if (request.isInterceptionAllowed) {
        await Promise.allSettled(this.interceptors.map((interceptor) =>
          interceptor.onResponse(request, response, resolve, reject)
        ));
      }

      resolve(response);
    });
  };
}

interface Transport<Response> {
  handle(request: Request): Promise<Response>;
}

interface Interceptor<Response> {
  onResponse(request: Request, response: Response, resolve: (value: Response) => void, reject: (reason?: any) => void): Promise<void>;
}

export type { Interceptor, Transport };
export { Client };
