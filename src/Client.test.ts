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
      setDefaultHeaders: jest.fn(),
      isInterceptionAllowed: true
    };

    await client.perform(request as any);

    expect(transport.handle).toHaveBeenCalledWith(request);
    expect(request.setBaseURL).toHaveBeenCalledWith("http://localhost:3000");
    expect(request.setDefaultHeaders).toHaveBeenCalledWith({});
    expect(interceptor.onResponse).toHaveBeenCalledWith(request, response, expect.any(Function), expect.any(Function));
  });

  it("should properly intercept a request", async () => {
    const client = new Client("http://localhost:3000");

    const transport = {
      handle: jest.fn().mockImplementation(() => {
        return Promise.resolve({ status: 401 });
      })
    };

    client.setTransport(transport);

    const interceptor = {
      onResponse: jest.fn().mockImplementation((_, response, resolve, reject) => {
        if (response.status === 401) {
          resolve({ status: 200 });
        }

        reject();
      })
    };

    client.setInterceptor(interceptor);

    const request = {
      setBaseURL: jest.fn(),
      setDefaultHeaders: jest.fn(),
      isInterceptionAllowed: true
    };

    const response = await client.perform(request as any);

    expect(transport.handle).toHaveBeenCalledWith(request);
    expect(interceptor.onResponse).toHaveBeenCalledWith(request, { status: 401 }, expect.any(Function), expect.any(Function));
    expect(response).toEqual({ status: 200 });
  });
});
