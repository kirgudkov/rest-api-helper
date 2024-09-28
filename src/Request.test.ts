import { Request, Get, Head, Delete, Put, Patch, Post } from "./Request";

const path = "/test/:id";
const method = "get";
let request = new Request(method, path);

describe("Request", () => {

	beforeEach(() => {
		request = new Request(method, path);
	});

	it("should create a Request with default url", () => {
		expect(request.url.protocol).toBe("");
		expect(request.url.host).toBe("");
		expect(request.url.pathname).toBe(path);
	});

	it("should set the base url", () => {
		request.setBaseURL("https://localhost");
		expect(request.url.protocol).toBe("https");
		expect(request.url.host).toBe("localhost");
		expect(request.url.pathname).toBe(path);

		request.setBaseURL("ftp://files");
		expect(request.url.protocol).toBe("ftp");
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

	it("should set interception allowed", () => {
		request.setInterceptionAllowed(false);
		expect(request.isInterceptionAllowed).toBe(false);
	});

	it("should set multiple headers", () => {
		request.setHeaders({
			"Content-Type": "application/json",
			"accept": "application/json",
		});

		expect(Object.keys(request.headers).length).toBe(2);
		expect(request.headers).toEqual({
			"content-type": "application/json",
			"accept": "application/json",
		});
	});

	it("should ignore case when setting headers", () => {
		request.setHeader("content-type", "application/json");
		expect(request.headers).toEqual({ "content-type": "application/json" });
		request.setHeader("Content-Type", "multipart/form-data");
		expect(request.headers).toEqual({ "content-type": "multipart/form-data" });
	});

	it("should set default headers and do not override previous", () => {
		request.setHeaders({
			"content-type": "application/json",
			"accept": "application/json",
		});

		request.setDefaultHeaders({
			"content-type": "multipart/form-data",
			"Cache-Control": "no-cache",
		});

		expect(Object.keys(request.headers).length).toBe(3);
		expect(request.headers).toEqual({
			"content-type": "application/json",
			"accept": "application/json",
			"cache-control": "no-cache",
		});
	});

	it("should set the body", () => {
		request.setBody(JSON.stringify({ test: "test" }));
		expect(request.body).toBe(JSON.stringify({ test: "test" }));
	});

	it("should set the object body as JSON", () => {
		request.setBodyJSON({ test: "test" });
		expect(request.body).toBe(JSON.stringify({ test: "test" }));
	});

	it("should set the array body as JSON", () => {
		request.setBodyJSON([{ test: "test" }]);
		expect(request.body).toBe(JSON.stringify([{ test: "test" }]));
	});

	it("should set a url param", () => {
		request.setUrlParam("id", 1);
		expect(request.url.pathname).toBe("/test/1");
	});

	it("should set a search param", () => {
		request.setSearchParam("id", 1);
		expect(request.url.searchParams.get("id")).toBe("1");
	});

	it("should set multiple search params", () => {
		request.setSearchParams({
			id: 1,
			name: "test",
			items: [1, 2, 3],
		});
		expect(request.url.searchParams.get("id")).toBe("1");
		expect(request.url.searchParams.get("name")).toBe("test");
		expect(request.url.searchParams.getAll("items")).toStrictEqual(["1", "2", "3"]);
	});

	it("should lowercase method", () => {
		request = new Request("GET", path);
		expect(request.method).toBe("get");
	});

	it("should create Get request", () => {
		const get = new Get(path);
		expect(get.method).toBe("get");
		expect(get.url.pathname).toBe(path);
	});

	it("should create Delete request", () => {
		const del = new Delete(path);
		expect(del.method).toBe("delete");
		expect(del.url.pathname).toBe(path);
	});

	it("should create Head request", () => {
		const head = new Head(path);
		expect(head.method).toBe("head");
		expect(head.url.pathname).toBe(path);
	});

	it("should create Put request", () => {
		const put = new Put(path);
		expect(put.method).toBe("put");
		expect(put.url.pathname).toBe(path);
	});

	it("should create Patch request", () => {
		const patch = new Patch(path);
		expect(patch.method).toBe("patch");
		expect(patch.url.pathname).toBe(path);
	});

	it("should create Post request", () => {
		const post = new Post(path);
		expect(post.method).toBe("post");
		expect(post.url.pathname).toBe(path);
	});

	it("should set the abort controller", () => {
		const controller = new AbortController();
		request.setAbortController(controller);
		expect(request.signal).toBe(controller.signal);
	});
});
