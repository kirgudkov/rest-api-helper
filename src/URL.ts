import { URLSearchParams } from "./URLSearchParams";

export class URL {

  host: string = "";
  protocol: string = "";
  searchParams = new URLSearchParams();

  private _pathname: string = "";

  constructor(url: string) {

    const regex = /^(\w+):\/\/([^\/]+)(\/.*)?/;
    const match = url.match(regex);

    if (!match) {
      throw new Error("Invalid URL");
    }

    this.protocol = match[1];
    this.host = match[2];
    this.pathname = match[3] ?? "";
  }

  get pathname() {
    return this._pathname;
  }

  set pathname(path: string) {
    const pattern = /:\w+/g;
    const matches = path.match(pattern);

    if (matches) {
      const uniqueMatches = new Set(matches);
      if (uniqueMatches.size !== matches.length) {
        throw new Error("URL: path contains duplicate url param keys");
      }
    }

    this._pathname = path;
  }

  get href() {
    const query = this.searchParams.toString();
    return `${this.protocol}://${this.host}${this.pathname}${query ? `?${query}` : ""}`;
  }

  toString() {
    return this.href;
  }
}

