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

  public async perform(request: Request) {
    if (!this.transport) {
      throw new Error("Transport is not defined");
    }

    request.setBaseURL(this.url);
    request.setDefaultHeaders(this.defaultHeaders);

    const promise = await this.transport.handle(request);

    await Promise.allSettled(
      this.interceptors.map((interceptor) =>
        interceptor.onResponse(promise)
      )
    );

    return promise;
  };
}

interface Transport<Response> {
  handle(request: Request): Promise<Response>;
}

interface Interceptor<Response> {
  onResponse(response: Response): Promise<Response>;
}

export type { Interceptor, Transport };
export { Client };
