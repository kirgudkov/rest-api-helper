import { Client } from "./Client";

describe("Client", () => {
  it("should create a client", () => {
    const client = new Client("http://localhost:3000");

    expect(client).toBeDefined();
    expect(client.url).toBe("http://localhost:3000");
    expect(client.defaultHeaders).toEqual({});
  });

  it("should set transport", () => {
    const client = new Client("http://localhost:3000");
    const transport = {
      handle: jest.fn()
    };

    client.setTransport(transport);

    // @ts-expect-error - private property
    expect(client.transport).toBe(transport);
  });

  it("should set default headers", () => {
    const client = new Client("http://localhost:3000");
    const headers = {
      "Content-Type": "application/json"
    };

    client.setDefaultHeaders(headers);

    expect(client.defaultHeaders).toBe(headers);
  });

  it("should set interceptor", () => {
    const client = new Client("http://localhost:3000");
    const interceptor = {
      onResponse: jest.fn()
    };

    client.setInterceptor(interceptor);

    // @ts-expect-error - private property
    expect(client.interceptors).toContain(interceptor);
  });

  it("should perform a request", async () => {
    const response = { foo: "bar" };
    const client = new Client("http://localhost:3000");

    const transport = {
      handle: jest.fn().mockResolvedValue(response)
    };

    client.setTransport(transport);

    const interceptor = {
      onResponse: jest.fn()
    };

    client.setInterceptor(interceptor);

    const request = {
      setBaseURL: jest.fn(),
      setDefaultHeaders: jest.fn()
    };

    await client.perform(request as any);

    expect(transport.handle).toHaveBeenCalledWith(request);
    expect(request.setBaseURL).toHaveBeenCalledWith("http://localhost:3000");
    expect(request.setDefaultHeaders).toHaveBeenCalledWith({});
    expect(interceptor.onResponse).toHaveBeenCalledWith(response);
  });
});
