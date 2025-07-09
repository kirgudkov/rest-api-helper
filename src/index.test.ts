import { Transport, Interceptor, Client } from "./Client";
import { Request } from "./Request";
import { TimeoutError } from "./TimeoutError";

type Response = {
	status: number;
	json: () => Promise<any>;
};

const transport: Transport<Response> = {
	async perform(request) {
		return new Promise((resolve, reject) => {
			request.signal?.addEventListener("abort", () => {
				reject(new Error("AbortError"));
			}, { once: true });

			setTimeout(() => {
				resolve({
					status: 200,
					json: async () => ({ foo: "bar" }),
				});
			}, 100);
		});
	},
};

const interceptor: Interceptor<Response> = {
	onRequest: jest.fn().mockImplementation((request) => {
		return request;
	}),
	onResponse: jest.fn().mockImplementation(async (_, response) => {
		await new Promise((resolve) => setTimeout(resolve, 100));

		return response;
	}),
};

const baseURL = "https://example.com";

const defaultHeaders = {
	"content-type": "application/json",
	"accept": "application/json",
};

const client = new Client<Response>(transport, "https://example.com")
	.setDefaultHeaders(defaultHeaders)
	.setInterceptor(interceptor);

let request = new Request("get", "/latest/:id");

describe("index", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		request = new Request("get", "/latest/:id")
			.setSearchParam("amount", 10)
			.setSearchParam("from", "GBP")
			.setSearchParam("to", "USD")
			.setUrlParam("id", 2)
			.setTimeout(1000);
	});

	it("should create a client", () => {
		expect(client).toBeDefined();
		expect(client.baseURL).toBe(baseURL);
		expect(client.defaultHeaders).toEqual(defaultHeaders);
	});

	it("should create a request", async () => {
		expect(request.url.pathname).toBe("/latest/2");
		expect(request.url.searchParams.get("amount")).toBe("10");
		expect(request.url.searchParams.get("from")).toBe("GBP");
		expect(request.url.searchParams.get("to")).toBe("USD");
	});

	it("should perform a request", async () => {
		const response = await client.perform(request);

		expect(request.url.protocol).toBe("https");
		expect(request.url.host).toBe("example.com");
		expect(interceptor.onResponse).toHaveBeenCalledTimes(1);

		const json = await response.json();

		expect(response.status).toBe(200);
		expect(json).toEqual({ foo: "bar" });
	});

	it("should clear timeout on success", async () => {
		jest.spyOn(global, "clearTimeout");
		await client.perform(request);
		expect(clearTimeout).toHaveBeenCalledTimes(1);
	});

	it("should clear timeout on abort", async () => {
		jest.spyOn(global, "clearTimeout");
		const abortController = new AbortController();
		request.setAbortController(abortController);

		const performPromise = client.perform(request);
		await new Promise((resolve) => setTimeout(resolve, 50));
		abortController.abort();

		await expect(performPromise).rejects.toThrow("AbortError");
		expect(clearTimeout).toHaveBeenCalledTimes(1);
	});

	it("should fail with timeout", async () => {
		request.setTimeout(50);
		await expect(client.perform(request)).rejects.toThrow(TimeoutError);
	});
});
