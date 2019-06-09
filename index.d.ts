declare module 'rest-api-helper';

interface RequestConfig {
  url: string;
  method: 'post' | 'get' | 'put' | 'delete' | 'head' | 'patch';
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
  },
  successStatus: number[];
  request: {
    [method: string]: RequestConfig;
  };
}

interface Body {
  [key: string]: any;
}

type QueryParams = Body;

interface Headers {
  [key: string]: string;
}

interface Response {
  status: number;
  body: any;
  headers: Headers;
}

interface Request {
  withHeaders(headers: Headers): Request;
  withBody(body: Body): Request;
  withQueryParams(params: QueryParams): Request;
  withUrlParam(name: string, value: string | number): Request;
  /*
   * @deprecated - use withUrlParam
   */
  withParam(name: string, value: string | number): Request;
  fetch(): Promise<Response>;
}

export class RestApiHelper {
  static configure(config: Config): void;
  static build(method: string): Request;
}

export default RestApiHelper;
