import { URLSearchParams } from "./URLSearchParams";

export class URL {
  host: string = "";
  protocol: string = "";
  pathname: string = "";
  searchParams: URLSearchParams;

  constructor(url: string) {
    this.searchParams = new URLSearchParams();

    const regex = /^(\w+):\/\/([^\/]+)(\/.*)?/;
    const match = url.match(regex);

    if (match) {
      this.protocol = match[1];
      this.host = match[2];
      this.pathname = match[3] || "";
    } else {
      throw new Error("Invalid URL");
    }
  }

  get href(): string {
    const query = this.searchParams.toString();
    return `${this.protocol}://${this.host}${this.pathname}${query ? `?${query}` : ""}`;
  }

  toString(): string {
    return this.href;
  }
}

