import { Request } from "./Request";

class Client<T> {

	#transport: Transport<T>;
	#interceptors: Interceptor<T>[] = [];

	#baseURL: string;
	get baseURL() {
		return this.#baseURL;
	}

	set baseURL(value) {
		this.#baseURL = value;
	}

	#defaultHeaders: Record<string, string> = {};
	get defaultHeaders() {
		return this.#defaultHeaders;
	}

	set defaultHeaders(value) {
		this.#defaultHeaders = value;
	}

	constructor(transport: Transport<T>, baseURL: string) {
		this.#transport = transport;
		this.#baseURL = baseURL;
	}

	setDefaultHeaders(headers: Record<string, string>) {
		this.#defaultHeaders = headers;
		return this;
	}

	setInterceptor(interceptor: Interceptor<T>) {
		this.#interceptors.push(interceptor);
		return this;
	}

	async perform(request: Request) {
		request.setBaseURL(this.#baseURL);
		request.setDefaultHeaders(this.#defaultHeaders);

		const response = await request
			.prepare()
			.then(request => this.#transport.perform(request));

		if (!request.isInterceptionAllowed) {
			return response;
		}

		let _response = response;
		for (const interceptor of this.#interceptors) {
			_response = await interceptor.onResponse(request, _response, this);
		}

		return _response;
	};
}

interface Transport<Response> {
	perform(request: Request): Promise<Response>;
}

interface Interceptor<Response> {
	onResponse(request: Request, response: Response, client: Client<Response>): Promise<Response>;
}

export type { Interceptor, Transport };
export { Client };
