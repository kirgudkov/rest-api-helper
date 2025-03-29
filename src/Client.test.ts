import { Client } from "./Client";
import { Post } from "./Request";

const url = "http://base.url";

let request = {
	setBaseURL: jest.fn(),
	setDefaultHeaders: jest.fn(),
	isInterceptionAllowed: true,
	prepare: jest.fn(),
};

let transport = {
	perform: jest.fn().mockResolvedValue("response"),
};

describe("Client", () => {
	beforeEach(() => {
		transport = {
			perform: jest.fn().mockResolvedValue("response"),
		};

		request = {
			setBaseURL: jest.fn(),
			setDefaultHeaders: jest.fn(),
			isInterceptionAllowed: true,
			prepare: jest.fn(),
		};

		request.prepare = jest.fn().mockResolvedValue(request);
	});

	it("should create an instance with passed url and empty base headers", () => {
		const client = new Client(transport, url);

		expect(client).toBeDefined();
		expect(client.baseURL).toBe(url);
		expect(client.defaultHeaders).toEqual({});
	});

	it("baseURL setter should change url", () => {
		const client = new Client(transport, url);

		expect(client).toBeDefined();
		expect(client.baseURL).toBe(url);

		client.baseURL = "foo";
		expect(client.baseURL).toBe("foo");
	});

	it("defaultHeaders setter should set default headers", () => {
		const client = new Client(transport, url);
		const headers = { "Content-Type": "application/json" };

		client.setDefaultHeaders(headers);
		expect(client.defaultHeaders).toBe(headers);

		const newHeaders = { "Content-Type": "application/xml" };
		client.defaultHeaders = newHeaders;
		expect(client.defaultHeaders).toEqual(newHeaders);
	});

	it("perform() should return response", async () => {
		const client = new Client(transport, url);
		const result = await client.perform(request as any);

		expect(transport.perform).toHaveBeenCalledTimes(1);
		expect(result).toBe("response");
	});

	it("should call interceptor", async () => {
		const client = new Client(transport, url);

		const interceptor = {
			onResponse: jest.fn().mockImplementation((_, response) => {
				return response;
			}),
		};

		await client
			.setInterceptor(interceptor)
			.perform(request as any);

		expect(interceptor.onResponse).toHaveBeenCalledTimes(1);
	});

	it("interceptor should modify response", async () => {
		const client = new Client(transport, url);

		const interceptor = {
			onResponse: jest.fn().mockImplementation(() => {
				return "modified";
			}),
		};

		client.setInterceptor(interceptor);

		const response = await client.perform(request as any);

		expect(interceptor.onResponse).toHaveBeenCalledTimes(1);
		expect(response).toEqual("modified");
	});

	it("should call interceptors in order, chaining responses", async () => {
		const client = new Client(transport, url);
		const interceptorsCallOrder: {
			response: string;
			interceptor: string;
		}[] = [];

		const interceptorA = {
			onResponse: jest.fn().mockImplementation((_, response) => {
				interceptorsCallOrder.push({
					response, interceptor: "A",
				});

				return "interceptedA";
			}),
		};

		const interceptorB = {
			onResponse: jest.fn().mockImplementation((_, response) => {
				interceptorsCallOrder.push({
					response, interceptor: "B",
				});
				return "interceptedB";
			}),
		};

		client
			.setInterceptor(interceptorA)
			.setInterceptor(interceptorB);

		const response = await client.perform(request as any);
		expect(interceptorA.onResponse).toHaveBeenCalledTimes(1);
		expect(interceptorB.onResponse).toHaveBeenCalledTimes(1);
		expect(interceptorsCallOrder).toEqual([
			{ response: "response", interceptor: "A" },
			{ response: "interceptedA", interceptor: "B" },
		]);
		expect(response).toEqual("interceptedB");
	});

	it("should fail after all retries", async () => {
		const client = new Client(transport, url);
		const request = new Post("url")
			.setMaxAttempts(2)
			.setBaseDelay(50);

		transport.perform = jest.fn().mockResolvedValue("failed");

		const interceptor = {
			onResponse: jest.fn().mockImplementation(async (request, response, client) => {
				if (response === "failed") {
					try {
						return await client.perform(request);
					}
					catch (e) {
						expect(e).toEqual(new Error("Max attempts reached"));
					}
				}

				return response;
			}),
		};

		client.setInterceptor(interceptor);

		const response = await client.perform(request);

		expect(interceptor.onResponse).toHaveBeenCalledTimes(2);
		expect(response).toEqual("failed");
	});

	it("should success after retries", async () => {
		const client = new Client(transport, url);
		const request = new Post("url")
			.setMaxAttempts(100)
			.setBaseDelay(50);

		transport.perform = jest.fn()
			.mockResolvedValueOnce("failed")
			.mockResolvedValueOnce("success");

		let attempts = 1;

		const interceptor = {
			onResponse: jest.fn().mockImplementation(async (request, response, client) => {
				if (response === "failed") {
					attempts++;
					return await client.perform(request);
				}

				return response;
			}),
		};

		client.setInterceptor(interceptor);

		const response = await client.perform(request);

		expect(attempts).toBe(2);
		expect(interceptor.onResponse).toHaveBeenCalledTimes(2);
		expect(response).toEqual("success");
	});
});
