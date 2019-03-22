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
  [key: string]: any,
}

interface Headers {
  [key: string]: string,
}

interface Response {
  status: number,
  body: any,
  headers: Headers,
}

interface Request {
  withHeaders(headers: Headers): Request,
  withBody(body: Body): Request,
  withParam(): Request,
  fetch(): Promise<any>,
}

export class RestApiHelper {
  static configure(config: Config): void;
  static build(method: string): Request;
  static builder(): RestApiHelper;
}

export default RestApiHelper;
