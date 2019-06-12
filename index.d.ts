declare module 'rest-api-helper';

interface RequestConfig {
  url: string,
  method: 'post' | 'get' | 'put' | 'delete' | 'head' | 'patch',
  headers?: Headers,
}

export interface Config {
  baseURL: string,
  logger: boolean,
  statusDescription: {
    [status: number]: string,
  },
  headers?: {
    [key: string]: string,
  },
  successStatus: number[],
  request: {
    [method: string]: RequestConfig,
  },
}

interface Body {
  [key: string]: any;
}

type QueryParams = Body;

interface Headers {
  [key: string]: string;
}

export interface Response {
  status: number;
  body: any;
  headers: Headers;
}

export interface Request {
  withHeaders(headers: Headers): Request;
  withBody(body: Body): Request;
  shouldBeIntercepted(value: boolean): Request;
  withQueryParams(params: QueryParams): Request;
  withUrlParam(name: string, value: string | number): Request;
  /*
   * @deprecated - use withUrlParam
   */
  withParam(name: string, value: string | number): Request;
  fetch(): Promise<Response>;
}

export interface Interceptor {
  delegate: (response: Response) => void; 
}

export class RestApiHelper {
  /*
   * @deprecated - use withConfig
   */
  static configure(config: Config): void;
  static build(method: string): Request;

  static builder(): RestApiHelper;
  withConfig(config: any): RestApiHelper;
  withInterceptor(interceptor: Interceptor): RestApiHelper;
}

export default RestApiHelper;
