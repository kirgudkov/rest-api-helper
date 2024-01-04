import { Request } from "./Request";

const path = "/test/:id";
const method = "get";
let request = new Request(path, method);

describe("Request", () => {

  beforeEach(() => {
    request = new Request(path, method);
  });

  it("should create a Request with default url", () => {
    expect(request.url.protocol).toBe(Request.DEFAULT_PROTOCOL);
    expect(request.url.host).toBe(Request.DEFAULT_HOST);
    expect(request.url.pathname).toBe(path);
  });

  it("should set the base url", () => {
    request.setBaseURL("https://localhost");
    expect(request.url.protocol).toBe("https:");
    expect(request.url.host).toBe("localhost");
    expect(request.url.pathname).toBe(path);

    request.setBaseURL("ftp://files");
    expect(request.url.protocol).toBe("ftp:");
    expect(request.url.host).toBe("files");
  });

  it("should set a single header", () => {
    request.setHeader("content-type", "application/json");
    expect(request.headers["content-type"]).toBe("application/json");
    expect(Object.keys(request.headers).length).toBe(1);
  });

  it("should remove a single header", () => {
    request.setHeader("content-type", "application/json");
    request.removeHeader("content-type");
    expect(Object.keys(request.headers).length).toBe(0);
  });

  it("should set multiple headers", () => {
    request.setHeaders({
      "content-type": "application/json",
      "accept": "application/json"
    });
    expect(Object.keys(request.headers).length).toBe(2);
  });

  it("should ignore case when setting headers", () => {
    request.setHeader("content-type", "application/json");
    expect(request.headers).toEqual({ "content-type": "application/json" });
    request.setHeader("Content-Type", "multipart/form-data");
    expect(request.headers).toEqual({ "content-type": "multipart/form-data" });
  })

  it("should set default headers and do not override previous", () => {
    request.setHeaders({
      "content-type": "application/json",
      "accept": "application/json"
    });

    request.setDefaultHeaders({
      "content-type": "multipart/form-data",
      "cache-control": "no-cache"
    });

    expect(Object.keys(request.headers).length).toBe(3);
    expect(request.headers).toEqual({
      "content-type": "application/json",
      "accept": "application/json",
      "cache-control": "no-cache"
    });
  });

  it("should set the body", () => {
    request.setBody(JSON.stringify({ test: "test" }));
    expect(request.body).toBe(JSON.stringify({ test: "test" }));
  });

  it("should set a url param", () => {
    request.setUrlParam("id", 1);
    expect(request.url.pathname).toBe("/test/1");
  });

  it("should set a search param", () => {
    request.setSearchParam("id", 1);
    expect(request.url.searchParams.get("id")).toBe("1");
  });
});
