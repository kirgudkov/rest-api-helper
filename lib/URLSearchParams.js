"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.URLSearchParams = void 0;
class URLSearchParams {
    constructor() {
        this.params = new Map();
    }
    append(key, value) {
        var _a;
        if (this.params.has(key)) {
            (_a = this.params.get(key)) === null || _a === void 0 ? void 0 : _a.push(value);
        }
        else {
            this.params.set(key, [value]);
        }
    }
    get(key) {
        var _a;
        return (_a = this.params.get(key)) === null || _a === void 0 ? void 0 : _a[0];
    }
    getAll(key) {
        var _a;
        return (_a = this.params.get(key)) !== null && _a !== void 0 ? _a : [];
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
exports.URLSearchParams = URLSearchParams;
