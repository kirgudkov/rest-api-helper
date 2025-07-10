export class URLSearchParams {
  private params: Map<string, string[]> = new Map();

  append(key: string, value: string) {
    if (this.params.has(key)) {
      this.params.get(key)?.push(value);
    } else {
      this.params.set(key, [value]);
    }
  }

  get(key: string) {
    return this.params.get(key)?.[0];
  }

  getAll(key: string) {
    return this.params.get(key) ?? [];
  }

  toString() {
    let result = "";

    this.params.forEach((values, key) => {
      const name = values.length > 1 ? `${key}[]` : key;

      values.forEach(value => {
        result += `${result ? "&" : ""}${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
      });
    });

    return result ? `?${result}` : "";
  }
}
