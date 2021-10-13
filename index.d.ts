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

export interface Request<T> {

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
  onIntercept: (request: Request<any>, resolver: (value: PromiseLike<any> | any) => void, response: Response<any>) => void
}

export class RestApiHelper {
  /*
   * @deprecated - use withConfig
   */
  static configure(config: Config): void;

  static build<T = void>(endpoint: string | number): Request<T>;

  static post<T>(url: string): Request<T>;

  static get<T>(url: string): Request<T>;

  static put<T>(url: string): Request<T>;

  static delete<T>(url: string): Request<T>;

  static head<T>(url: string): Request<T>;

  static patch<T>(url: string): Request<T>;

  static options<T>(url: string): Request<T>;

  static trace<T>(url: string): Request<T>;

  static connect<T>(url: string): Request<T>;

  static builder(): RestApiHelper;

  withInterceptor<T>(interceptor: Interceptor): RestApiHelper;

  withConfig(config: Config): RestApiHelper;
}

export default RestApiHelper;
