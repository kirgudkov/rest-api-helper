"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.URL = void 0;
const URLSearchParams_1 = require("./URLSearchParams");
class URL {
    constructor(url) {
        var _a;
        this.host = "";
        this.protocol = "";
        this.searchParams = new URLSearchParams_1.URLSearchParams();
        this._pathname = "";
        if (!url) {
            return;
        }
        const regex = /^(\w+):\/\/([^\/]+)(\/.*)?/;
        const match = url.match(regex);
        if (!match) {
            throw new Error("Invalid URL");
        }
        this.protocol = match[1];
        this.host = match[2];
        this.pathname = (_a = match[3]) !== null && _a !== void 0 ? _a : "";
    }
    get pathname() {
        return this._pathname;
    }
    set pathname(path) {
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
        return `${this.protocol}://${this.host}${this.pathname}${this.searchParams.toString()}`;
    }
    toString() {
        return this.href;
    }
}
exports.URL = URL;
