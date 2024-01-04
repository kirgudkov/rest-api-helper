export class URLSearchParams {
  private params: Map<string, string[]>;

  constructor() {
    this.params = new Map();
  }

  append(key: string, value: string) {
    if (this.params.has(key)) {
      this.params.get(key)?.push(value);
    } else {
      this.params.set(key, [value]);
    }
  }

  get(key: string): string | undefined {
    const values = this.params.get(key);
    return values ? values[0] : undefined;
  }

  getAll(key: string): string[] {
    return this.params.get(key) || [];
  }

  toString(): string {
    let paramString = "";
    this.params.forEach((values, key) => {
      if (values.length > 1) {
        values.forEach(value => {
          paramString += `${paramString ? "&" : ""}${encodeURIComponent(key)}[]=${encodeURIComponent(value)}`;
        });

        return;
      }

      values.forEach(value => {
        paramString += `${paramString ? "&" : ""}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      });
    });
    return paramString;
  }
}
