export class RequestError extends Error {
	constructor(status, description, message, headers) {
		super();
		this.constructor = status;
		this.name = status;
		this.description = description;
		this.message = message;
		this.headers = headers;
	}
}
