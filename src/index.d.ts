export class Request {

  readonly url: URL;
  readonly method: string;
  readonly headers: Record<string, string>;

  isInterceptionAllowed: boolean;
  body: BodyInit | null;

  /**
   * Creates a new request with a path and a method (GET, POST, PUT, DELETE etc).
   * @param path a string that can contain URL parameters, e.g. /users/:id
   * @param method a string that represents an HTTP method, e.g. GET, POST, PUT, DELETE. Case-insensitive.
   * @throws {Error} if path contains duplicate URL parameters
   */
  constructor(path: string, method: string);

  /**
   * Appends or overrides existing header by key.
   * @param key a header name, case-insensitive
   * @param value a header value
   */
  setHeader(key: string, value: string): Request;

  /**
   * Set headers from an object. Overrides existing keys, so basically it's a merge.
   * @param headers an object with key-value pairs, where key is a header name, case-insensitive
   * @returns {Request}
   */
  setHeaders(headers: Record<string, string>): Request;

  /**
   * Removes a header by key, if it exists.
   * @param key a header name, case-insensitive
   * @returns {Request}
   */
  removeHeader(key: string): Request;

  /**
   * Set the body of the request.
   * @param data
   * @returns {Request}
   */
  setBody(data: BodyInit): Request;

  /**
   * A shorthand for setting the body as JSON, so you don't have to call JSON.stringify yourself.
   * @param data
   * @returns {Request}
   */
  setBodyJSON(data: Record<string, unknown> | Record<string, unknown>[]): Request;

  /**
   * Allow or disallow interception of the request. True by default.
   * Useful for refresh token requests, when you don't want to catch 401s (in case if your refresh token is expired) and fall into an infinite refreshing loop.
   * @param allowed
   * @returns {Request}
   */
  setInterceptionAllowed(allowed: boolean): Request;

  /**
   * Set the AbortController for the request so you can manually abort it.
   * @param abortController
   * @returns {Request}
   */
  setAbortController(abortController: AbortController): Request;

  /**
   * Set a URL parameter. It will replace the occurrence of `:${key}` in the URL.
   * @param key
   * @param value
   */
  setUrlParam(key: string, value: string | number): Request;

  /**
   * Set a query parameter. It will append the key-value pair to the URL.
   * e.g. setSearchParam("name", "John") -> /users?name=John
   * or setSearchParam("names", ["John", "Doe"]) -> /users?names[]=John&names[]=Doe
   * @param key
   * @param value
   */
  setSearchParam(key: string, value: string | number | boolean | Array<string | number | boolean>): Request;

  /**
   * Set multiple query parameters. It will append the key-value pairs to the URL.
   * e.g. setSearchParams({ name: "John", age: 30 }) -> /users?name=John&age=30
   * or setSearchParams({ names: ["John", "Doe"] }) -> /users?names[]=John&names[]=Doe
   * @param params
   */
  setSearchParams(params: Record<string, string | number | boolean | Array<string | number | boolean>>): Request;
}

export class Get extends Request {
  constructor(path: string);
}

export class Post extends Request {
  constructor(path: string);
}

export class Put extends Request {
  constructor(path: string);
}

export class Delete extends Request {
  constructor(path: string);
}

export class Patch extends Request {
  constructor(path: string);
}

export class Head extends Request {
  constructor(path: string);
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
