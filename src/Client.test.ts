import { Client } from "./Client";

const url = "http://base.url";

const request = {
	setBaseURL: jest.fn(),
	setDefaultHeaders: jest.fn(),
	isInterceptionAllowed: true
};

describe("Client", () => {
	it("should create an instance", () => {
		const client = new Client(url);

		expect(client).toBeDefined();
		expect(client.baseURL).toBe(url);
		expect(client.defaultHeaders).toEqual({});
	});

	it("should change url", () => {
		const client = new Client(url);

		expect(client).toBeDefined();
		expect(client.baseURL).toBe(url);

		client.baseURL = "foo";
		expect(client.baseURL).toBe("foo");
	});

	it("should set default headers", () => {
		const client = new Client(url);
		const headers = { "Content-Type": "application/json" };

		client.setDefaultHeaders(headers);
		expect(client.defaultHeaders).toBe(headers);

		client.defaultHeaders = { "Content-Type": "application/text" };
		expect(client.defaultHeaders).toEqual({ "Content-Type": "application/text" });
	});

	it("should throw error if transport is not set", () => {
		const client = new Client(url);
		expect(client.perform(request as any)).rejects.toBeDefined();
	});

	it("should perform a request", async () => {
		const response = { foo: "bar" };
		const client = new Client(url);

		const transport = {
			handle: jest.fn().mockResolvedValue(response)
		};

		client.setTransport(transport);

		const interceptor = {
			onResponse: jest.fn().mockImplementation((_, response, promise) => {
				promise.resolve(response);
			})
		};

		client.setInterceptor(interceptor);

		const request = {
			setBaseURL: jest.fn(),
			setDefaultHeaders: jest.fn(),
			isInterceptionAllowed: true
		};

		const result = await client.perform(request as any);

		expect(transport.handle).toHaveBeenCalledTimes(1);
		expect(interceptor.onResponse).toHaveBeenCalledTimes(1);
		expect(result).toBe(response);
	});

	it("should properly intercept a request", async () => {
		const client = new Client(url);

		const transport = {
			handle: jest.fn().mockImplementation(() => {
				return Promise.resolve({ status: 401 });
			})
		};

		client.setTransport(transport);

		const interceptor = {
			onResponse: jest.fn().mockImplementation((_, response, promise) => {
				if (response.status === 401) {
					promise.resolve("modified");
				}

				promise.reject();
			})
		};

		client.setInterceptor(interceptor);

		const request = {
			setBaseURL: jest.fn(),
			setDefaultHeaders: jest.fn(),
			isInterceptionAllowed: true
		};

		const response = await client.perform(request as any);

		expect(transport.handle).toHaveBeenCalledTimes(1);
		expect(interceptor.onResponse).toHaveBeenCalledTimes(1);
		expect(response).toEqual("modified");
	});
});
