"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
var _Client_transport, _Client_interceptors, _Client_baseURL, _Client_defaultHeaders;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
class Client {
    get baseURL() {
        return __classPrivateFieldGet(this, _Client_baseURL, "f");
    }
    set baseURL(value) {
        __classPrivateFieldSet(this, _Client_baseURL, value, "f");
    }
    get defaultHeaders() {
        return __classPrivateFieldGet(this, _Client_defaultHeaders, "f");
    }
    set defaultHeaders(value) {
        __classPrivateFieldSet(this, _Client_defaultHeaders, value, "f");
    }
    constructor(baseURL) {
        _Client_transport.set(this, void 0);
        _Client_interceptors.set(this, []);
        _Client_baseURL.set(this, void 0);
        _Client_defaultHeaders.set(this, void 0);
        __classPrivateFieldSet(this, _Client_baseURL, baseURL, "f");
        __classPrivateFieldSet(this, _Client_defaultHeaders, {}, "f");
    }
    setTransport(transport) {
        __classPrivateFieldSet(this, _Client_transport, transport, "f");
        return this;
    }
    setDefaultHeaders(headers) {
        __classPrivateFieldSet(this, _Client_defaultHeaders, headers, "f");
        return this;
    }
    setInterceptor(interceptor) {
        __classPrivateFieldGet(this, _Client_interceptors, "f").push(interceptor);
        return this;
    }
    perform(request) {
        request.setBaseURL(__classPrivateFieldGet(this, _Client_baseURL, "f"));
        request.setDefaultHeaders(__classPrivateFieldGet(this, _Client_defaultHeaders, "f"));
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            if (!__classPrivateFieldGet(this, _Client_transport, "f")) {
                reject("Transport is not defined");
                return;
            }
            try {
                const response = yield __classPrivateFieldGet(this, _Client_transport, "f").handle(request);
                if (!request.isInterceptionAllowed || !__classPrivateFieldGet(this, _Client_interceptors, "f").length) {
                    resolve(response);
                    return;
                }
                __classPrivateFieldGet(this, _Client_interceptors, "f").forEach(interceptor => interceptor.onResponse(request, response, { resolve, reject }));
            }
            catch (error) {
                reject(error);
            }
        }));
    }
    ;
}
exports.Client = Client;
_Client_transport = new WeakMap(), _Client_interceptors = new WeakMap(), _Client_baseURL = new WeakMap(), _Client_defaultHeaders = new WeakMap();
