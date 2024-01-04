export class Request {

  readonly url: URL;
  readonly method: string;
  readonly headers: Record<string, string>;

  isInterceptionAllowed: boolean;
  body: BodyInit | null;

  constructor(path: string, method: string);

  setHeader(key: string, value: string): Request;
  setHeaders(headers: Record<string, string>): Request;
  removeHeader(key: string): Request;
  setBody(data: BodyInit): Request;
  setInterceptionAllowed(allowed: boolean): Request;
  setAbortController(abortController: AbortController): Request;
  setUrlParam(key: string, value: string | number): Request;
  setSearchParam(key: string, value: string | number | boolean | Array<string | number | boolean>): Request;
  setSearchParams(params: Record<string, string | number | boolean | Array<string | number | boolean>>): Request;
}

export class Client<Response> {

  url: string;
  defaultHeaders: Record<string, string>;

  constructor(url: string, transport?: Transport<Response>);

  setTransport(transport: Transport<Response>): Client<Response>;
  setDefaultHeaders(headers: Record<string, string>): Client<Response>;
  setInterceptor(interceptor: Interceptor<Response>): Client<Response>;
  perform(request: Request): Promise<Response>;
}

export interface Transport<Response> {
  handle(request: Request): Promise<Response>;
}

export interface Interceptor<Response> {
  onResponse(request: Request, response: Response, resolve: (value: Response) => void, reject: (reason?: any) => void): Promise<void>;
}
