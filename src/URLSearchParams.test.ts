import { URLSearchParams } from "./URLSearchParams";

describe("URLSearchParams", () => {
  it("should create URLSearchParams", () => {
    const params = new URLSearchParams();

    expect(params).toBeDefined();
    expect(params.toString()).toBe("");
  });

  it("should append a parameter", () => {
    const params = new URLSearchParams();

    params.append("foo", "bar");

    expect(params.toString()).toBe("foo=bar");
  });

  it("should append multiple parameters", () => {
    const params = new URLSearchParams();

    params.append("foo", "bar");
    params.append("foo", "baz");

    const encodedBrackets = encodeURIComponent("[]");
    expect(params.toString()).toBe(`foo${encodedBrackets}=bar&foo${encodedBrackets}=baz`);
  });

  it("should append multiple parameters with []", () => {
    const params = new URLSearchParams();

    params.append("a", "a");
    params.append("foo", "b");
    params.append("foo", "c");

    const encodedBrackets = encodeURIComponent("[]");
    expect(params.toString()).toBe(`a=a&foo${encodedBrackets}=b&foo${encodedBrackets}=c`);
  });

  it("should get a parameter", () => {
    const params = new URLSearchParams();

    params.append("foo", "bar");

    expect(params.get("foo")).toBe("bar");
  });

  it("should get undefined for a non-existing parameter", () => {
    const params = new URLSearchParams();

    expect(params.get("foo")).toBeUndefined();
  });

  it("should get all values for a parameter", () => {
    const params = new URLSearchParams();

    params.append("foo", "bar");
    params.append("foo", "baz");

    expect(params.getAll("foo")).toEqual(["bar", "baz"]);
  });

  it("should get an empty array for a non-existing parameter", () => {
    const params = new URLSearchParams();

    expect(params.getAll("foo")).toEqual([]);
  });

  it("should encode parameters", () => {
    const params = new URLSearchParams();

    params.append("foo", "bar baz");

    expect(params.toString()).toBe("foo=bar%20baz");
  });
});
