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
  onResponse: jest.fn().mockImplementation(async (response) => {
    await new Promise((resolve) => setTimeout(resolve, 100));

    return response;
  })
};

const baseURL = "https://example.com";

const client = new Client<Response>("https://example.com")
  .setDefaultHeaders({
    "content-type": "application/json",
    "accept": "application/json"
  })
  .setTransport(transport)
  .setInterceptor(interceptor);

const request = new Request("/latest", "get")
  .setSearchParam("amount", 10)
  .setSearchParam("from", "GBP")
  .setSearchParam("to", "USD");

describe("index", () => {
  it("should create a client", () => {
    expect(client).toBeDefined();
    expect(client.url).toBe(baseURL);
    expect(client.defaultHeaders).toEqual({
      "content-type": "application/json",
      "accept": "application/json"
    });
  });

  it("should create a request", async () => {
    expect(request.url.pathname).toBe("/latest");
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
