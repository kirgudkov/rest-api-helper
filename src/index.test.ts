import { Transport, Interceptor, Client } from "./Client";
import { Request } from "./Request";

type Response = {
	status: number;
	json: () => Promise<any>;
};

const transport: Transport<Response> = {
	async handle() {
		await new Promise((resolve) => setTimeout(resolve, 100));

		return {
			status: 200,
			json: async () => ({ foo: "bar" })
		};
	}
};

const interceptor: Interceptor<Response> = {
	onResponse: jest.fn().mockImplementation(async (_, response, promise) => {
		await new Promise((resolve) => setTimeout(resolve, 100));

		promise.resolve(response);
	})
};

const baseURL = "https://example.com";

const defaultHeaders = {
	"content-type": "application/json",
	"accept": "application/json"
};

const client = new Client<Response>("https://example.com")
	.setDefaultHeaders(defaultHeaders)
	.setTransport(transport)
	.setInterceptor(interceptor);

const request = new Request("get", "/latest/:id")
	.setSearchParam("amount", 10)
	.setSearchParam("from", "GBP")
	.setSearchParam("to", "USD")
	.setUrlParam("id", 2);

describe("index", () => {
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
});
