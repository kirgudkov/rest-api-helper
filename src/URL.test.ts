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
});
