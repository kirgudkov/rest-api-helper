import { URL } from "./URL";

class Request {
	readonly url = new URL();
	readonly method: string;
	readonly headers: Record<string, string> = {};

	constructor(method: string, path: string) {
		this.method = method.toLowerCase();
		this.url.pathname = path;
	}

	signal: AbortSignal | null = null;

	#isInterceptionAllowed = true;
	get isInterceptionAllowed() {
		return this.#isInterceptionAllowed;
	}

	#body: BodyInit | null = null;
	get body() {
		return this.#body;
	}

	setBaseURL(url: string) {
		const [protocol, host] = url.split("://");

		this.url.protocol = protocol;
		this.url.host = host;

		return this;
	};

	setHeaders(headers: Record<string, string>) {
		for (const [key, value] of Object.entries(headers)) {
			this.headers[key.toLowerCase()] = value;
		}

		return this;
	};

	setHeader(key: string, value: string) {
		this.headers[key.toLowerCase()] = value;

		return this;
	};

	removeHeader(key: string) {
		if (this.headers[key.toLowerCase()]) {
			delete this.headers[key.toLowerCase()];
		}

		return this;
	};

	setDefaultHeaders(headers: Record<string, string>) {
		for (const [key, value] of Object.entries(headers)) {
			if (!this.headers[key.toLowerCase()]) {
				this.headers[key.toLowerCase()] = value;
			}
		}

		return this;
	};

	setBody(data: BodyInit) {
		this.#body = data;

		return this;
	}

	setBodyJSON(data: Record<string, unknown> | Record<string, unknown>[]) {
		try {
			this.#body = JSON.stringify(data);
		}
		catch (error) {
			throw new Error("Request: failed to stringify the body");
		}

		return this;
	}

	setUrlParam(key: string, value: string | number) {
		this.url.pathname = this.url.pathname.replace(`:${key}`, value.toString());

		return this;
	};

	setInterceptionAllowed(allowed: boolean) {
		this.#isInterceptionAllowed = allowed;

		return this;
	}

	setAbortController(abortController: AbortController) {
		this.signal = abortController.signal;

		return this;
	}

	setSearchParam(key: string, value: string | number | boolean | Array<string | number | boolean>) {
		if (Array.isArray(value)) {
			value.forEach(item =>
				this.url.searchParams.append(key, item.toString())
			);
		} else {
			this.url.searchParams.append(key, value.toString());
		}

		return this;
	};

	setSearchParams(params: Record<string, string | number | boolean | Array<string | number | boolean>>) {
		for (const [key, value] of Object.entries(params)) {
			this.setSearchParam(key, value);
		}

		return this;
	}
}

class Get extends Request {
	constructor(path: string) {
		super("get", path);
	}
}

class Post extends Request {
	constructor(path: string) {
		super("post", path);
	}
}

class Put extends Request {
	constructor(path: string) {
		super("put", path);
	}
}

class Delete extends Request {
	constructor(path: string) {
		super("delete", path);
	}
}

class Patch extends Request {
	constructor(path: string) {
		super("patch", path);
	}
}

class Head extends Request {
	constructor(path: string) {
		super("head", path);
	}
}

export { Request, Get, Post, Put, Delete, Patch, Head };
