"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _Request_isInterceptionAllowed, _Request_body, _Request_signal;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Head = exports.Patch = exports.Delete = exports.Put = exports.Post = exports.Get = exports.Request = void 0;
const URL_1 = require("./URL");
class Request {
    get isInterceptionAllowed() {
        return __classPrivateFieldGet(this, _Request_isInterceptionAllowed, "f");
    }
    get body() {
        return __classPrivateFieldGet(this, _Request_body, "f");
    }
    constructor(path, method) {
        this.headers = {};
        this.url = new URL_1.URL();
        _Request_isInterceptionAllowed.set(this, true);
        _Request_body.set(this, null);
        _Request_signal.set(this, null);
        this.url.pathname = path;
        this.method = method.toLowerCase();
    }
    setBaseURL(url) {
        const [protocol, host] = url.split("://");
        this.url.protocol = protocol;
        this.url.host = host;
        return this;
    }
    ;
    setHeaders(headers) {
        Object.keys(headers).forEach(rawKey => {
            const formattedKey = rawKey.toLowerCase();
            this.headers[formattedKey] = headers[rawKey];
        });
        return this;
    }
    ;
    setHeader(key, value) {
        this.headers[key.toLowerCase()] = value;
        return this;
    }
    ;
    removeHeader(key) {
        if (this.headers[key.toLowerCase()]) {
            delete this.headers[key.toLowerCase()];
        }
        return this;
    }
    ;
    setDefaultHeaders(headers) {
        Object.keys(headers).forEach(rawKey => {
            const formattedKey = rawKey.toLowerCase();
            if (!this.headers[formattedKey]) {
                this.headers[formattedKey] = headers[rawKey];
            }
        });
        return this;
    }
    ;
    setBody(data) {
        __classPrivateFieldSet(this, _Request_body, data, "f");
        return this;
    }
    setBodyJSON(data) {
        try {
            __classPrivateFieldSet(this, _Request_body, JSON.stringify(data), "f");
        }
        catch (error) {
            throw new Error("Request: failed to stringify the body");
        }
        return this;
    }
    setUrlParam(key, value) {
        this.url.pathname = this.url.pathname.replace(`:${key}`, value.toString());
        return this;
    }
    ;
    setInterceptionAllowed(allowed) {
        __classPrivateFieldSet(this, _Request_isInterceptionAllowed, allowed, "f");
        return this;
    }
    setAbortController(abortController) {
        __classPrivateFieldSet(this, _Request_signal, abortController.signal, "f");
        return this;
    }
    setSearchParam(key, value) {
        if (Array.isArray(value)) {
            value.forEach((item) => {
                this.url.searchParams.append(key, item.toString());
            });
            return this;
        }
        this.url.searchParams.append(key, value.toString());
        return this;
    }
    ;
    setSearchParams(params) {
        Object.keys(params).forEach(key => {
            const value = params[key];
            if (Array.isArray(value)) {
                value.forEach((item) => {
                    this.url.searchParams.append(key, item.toString());
                });
                return;
            }
            this.url.searchParams.append(key, value.toString());
        });
        return this;
    }
}
exports.Request = Request;
_Request_isInterceptionAllowed = new WeakMap(), _Request_body = new WeakMap(), _Request_signal = new WeakMap();
class Get extends Request {
    constructor(path) {
        super(path, "get");
    }
}
exports.Get = Get;
class Post extends Request {
    constructor(path) {
        super(path, "post");
    }
}
exports.Post = Post;
class Put extends Request {
    constructor(path) {
        super(path, "put");
    }
}
exports.Put = Put;
class Delete extends Request {
    constructor(path) {
        super(path, "delete");
    }
}
exports.Delete = Delete;
class Patch extends Request {
    constructor(path) {
        super(path, "patch");
    }
}
exports.Patch = Patch;
class Head extends Request {
    constructor(path) {
        super(path, "head");
    }
}
exports.Head = Head;
