export class Request {

	readonly url: URL;
	readonly method: string;
	readonly headers: Headers;
	readonly body: BodyInit | null;
	readonly isInterceptionAllowed: boolean;

	/**
	 * Creates a new request with a path and a method (GET, POST, PUT, DELETE etc).
	 * @param method a string that represents an HTTP method, e.g. get, post, put, delete. Case-insensitive.
	 * @param path a string that can contain URL parameters, e.g. /users/:id
	 * @throws {Error} if path contains duplicate URL parameters
	 */
	constructor(method: Method, path: string);

	/**
	 * Appends or overrides existing header by key.
	 * @param key a header name, case-insensitive
	 * @param value a header value
	 */
	setHeader<K extends keyof Headers>(key: K, value: Headers[K]): Request;

	/**
	 * Set headers from an object. Overrides existing keys, so basically it's a merge.
	 * @param headers an object with key-value pairs, where key is a header name, case-insensitive
	 * @returns {Request}
	 */
	setHeaders(headers: Headers): Request;

	/**
	 * Removes a header by key, if it exists.
	 * @param key a header name, case-insensitive
	 * @returns {Request}
	 */
	removeHeader(key: keyof Headers): Request;

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
	 * Set a URL parameter. It will replace the occurrence of :key in the URL.
	 * @param key
	 * @param value
	 */
	setUrlParam(key: string, value: string | number): Request;

	/**
	 * Set a query parameter. It will append the key-value pair to the URL.
	 * e.g. setSearchParam("name", "John") -> /users?name=John
	 * or setSearchParam("names", ["John", "Alice"]) -> /users?names[]=John&names[]=Alice
	 * @param key
	 * @param value
	 */
	setSearchParam(key: string, value: string | number | boolean | Array<string | number | boolean>): Request;

	/**
	 * Set multiple query parameters. It will append the key-value pairs to the URL.
	 * e.g. setSearchParams({ name: "John", age: 30 }) -> /users?name=John&age=30
	 * or setSearchParams({ names: ["John", "Alice"] }) -> /users?names[]=John&names[]=Alice
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

/**
 * The glue substance for everything. Holds base URL, some default headers that will be passed to each Request,
 * transport and interceptors.
 */
export class Client<Response> {
	baseURL: string;
	defaultHeaders: Headers;

	constructor(baseURL: string);

	setTransport(transport: Transport<Response>): Client<Response>;

	setInterceptor(interceptor: Interceptor<Response>): Client<Response>;

	setDefaultHeaders(headers: Headers): Client<Response>;

	perform(request: Request): Promise<Response>;
}

/**
 * Defines one single method that will be called by Client to perform network request.
 * In here we have to implement the way we want to execute and handle every call whether it is fetch, or XHR or test mock etc.
 */
export interface Transport<Response> {
	handle(request: Request): Promise<Response>;
}

/**
 * The Interceptor interface binds you to implement `onResponse` method.
 * Instead of being resolved immediately, original promise will fall through this interceptor pipeline.
 * Inside onResponse implementation we can do whatever we want: check request/response, make additional requests (refresh tokens etc.)
 * resolve or reject original Promise
 */
export interface Interceptor<Response> {
	onResponse(request: Request, response: Response, promise: OriginalPromise<Response>): Promise<void>;
}

type OriginalPromise<T> = {
	resolve: (value: T) => void;
	reject: (reason?: unknown) => void;
};

type Headers = Record<string, string> & {
	"content-type"?: "application/json" | "application/x-www-form-urlencoded" | "multipart/form-data" | "text/plain" | "text/html" | string;
	"accept"?: "application/json" | "application/xml" | "text/plain" | "text/html" | "*/*" | string;
	"authorization"?: string;
	"user-agent"?: string;
	"cache-control"?: "no-cache" | "no-store" | "max-age=<seconds>" | "public" | "private" | string;
	"accept-encoding"?: "gzip" | "deflate" | "br" | string;
	"accept-language"?: string;
	"origin"?: string;
	"referer"?: string;
	"x-requested-with"?: "XMLHttpRequest" | string;
	"x-csrf-token"?: string;
	"x-api-key"?: string;
	"if-modified-since"?: string;
	"if-none-match"?: string;
	"access-control-allow-origin"?: "*" | string;
	"access-control-allow-methods"?: "GET" | "POST" | "PUT" | "DELETE" | "OPTIONS" | string;
	"content-length"?: string;
	"cookie"?: string;
};

type Method = "get" | "post" | "put" | "delete" | "patch" | "head" | "options" | "connect" | string;
