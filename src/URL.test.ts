import { URL } from "./URL";

describe("URL", () => {
  it("should create an URL", () => {
    const url = new URL("http://localhost:3000");

    expect(url).toBeDefined();
    expect(url.protocol).toBe("http");
    expect(url.host).toBe("localhost:3000");
    expect(url.pathname).toBe("");
    expect(url.searchParams).toBeDefined();
    expect(url.href).toBe("http://localhost:3000");
    expect(url.toString()).toBe("http://localhost:3000");
  });

  it("should create an URL with pathname", () => {
    const url = new URL("http://localhost:3000/pathname");

    expect(url).toBeDefined();
    expect(url.protocol).toBe("http");
    expect(url.host).toBe("localhost:3000");
    expect(url.pathname).toBe("/pathname");
    expect(url.searchParams).toBeDefined();
    expect(url.href).toBe("http://localhost:3000/pathname");
    expect(url.toString()).toBe("http://localhost:3000/pathname");
  });

  it("should throw an error for invalid URL", () => {
    expect(() => new URL("invalid")).toThrow();
    expect(() => new URL("https://")).toThrow();
  });

  it("should set create an URL when url params are unique", () => {
    expect(() => new URL("http://localhost:3000/:id")).not.toThrow();
    expect(() => new URL("http://localhost:3000/foos/:foo/bars/:bar")).not.toThrow();
  });

  it("should throw an error for duplicate keys in pathname", () => {
    expect(() => new URL("http://localhost:3000/:id/:id")).toThrow();
    expect(() => new URL("http://localhost:3000/foos/:foo/bars/:foo")).toThrow();
    expect(() => new URL("http://localhost:3000/foos/:foo/bars/:bar/:foo")).toThrow();
  });
});
