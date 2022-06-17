declare module 'rest-api-helper';

interface RequestConfig {
  url: string;
  method: 'post' | 'get' | 'put' | 'delete' | 'head' | 'patch' | 'options' | 'trace' | 'connect' | 'POST' | 'GET' | 'PUT' | 'DELETE' | 'HEAD' | 'PATCH' | 'OPTIONS' | 'TRACE' | 'CONNECT' | string;
  headers?: Headers;
}

export interface Config {
  baseURL: string;
  logger: boolean;
  statusDescription: {
    [status: number]: string;
  };
  headers?: {
    [key: string]: string;
  };
  successStatus: number[];
  request: {
    [method: string]: RequestConfig;
  };
}

interface Body {
  [key: string]: any;
}

type QueryParams = Body;

export interface Headers {
  [key: string]: string | undefined;
}

export interface Response<T> {
  status: number;
  body: T;
  headers: Headers;
}

export interface RequestError extends Error {
  name: string
  description: string
  message: string
  headers: string
}

type Options = {
  get url(): string
}

export interface Request<T> {

  get options(): Options

  withHeaders(headers: Headers): Request<T>;

  withBody(body: Body | string): Request<T>;

  withAbortController(abortController: AbortController): Request<T>;

  shouldBeIntercepted(value: boolean): Request<T>;

  withQueryParams(params: QueryParams): Request<T>;

  withUrlParam(name: string, value: string | number): Request<T>;

  /*
   * @deprecated - use withUrlParam
   */
  withParam(name: string, value: string | number): Request<T>;

  fetch(): Promise<Response<T>>;
}

export interface Interceptor {

  delegate?: OnInterceptDelegate;

  /*
   * [401, 403] for example
   * these statuses will be intercepted
   */
  statuses: number[]
}

export interface OnInterceptDelegate {
  onIntercept: (request: Request<any>, resolver: (value: PromiseLike<any> | any) => void, reject: (reason: any) => void, response: Response<any>) => void
}

export class RestApiHelper {
  /*
   * @deprecated - use withConfig
   */
  static configure(config: Config): void;

  static build<T = void>(endpoint: string | number): Request<T>;

  static post<T = void>(url: string): Request<T>;

  static get<T = void>(url: string): Request<T>;

  static put<T = void>(url: string): Request<T>;

  static delete<T = void>(url: string): Request<T>;

  static head<T = void>(url: string): Request<T>;

  static patch<T = void>(url: string): Request<T>;

  static options<T = void>(url: string): Request<T>;

  static trace<T = void>(url: string): Request<T>;

  static connect<T = void>(url: string): Request<T>;

  static builder(): RestApiHelper;

  withInterceptor<T>(interceptor: Interceptor): RestApiHelper;

  withConfig(config: Config): RestApiHelper;
}

export default RestApiHelper;
