`rest-api-helper` is a lightweight package that simplifies and abstracts the process of making HTTP requests.
It provides a modular and extensible approach, allowing to define custom transport mechanisms, intercept and modify responses, and configure requests with ease. 

The library promotes separation of concerns and offers a structured API for creating requests, setting headers, body, URL and query parameters.

# Installation

Install the package using npm:

```bash
npm install rest-api-helper
```

or yarn:
```bash
yarn add rest-api-helper
```

# Usage

To perform any request it is required to:

- Define _transport_ aka the way you're going to communicate
- Configure _client_ to glue everything together (base url, headers, transport etc)
- Create _request_ object


---

### Transport implementation

The `Transport` interface obliges you to implement one single method `handle`. It can do whatever you want whether it's `fetch` or `XHR` or `setTimeout` mock. In most cases, you're going to use the fetch API:

```typescript
import { Transport } from "rest-api-helper";

const transport: Transport<Response> = {
  handle(request) {
    return fetch(request.url.href, request);
  }
};
```

---

### Interceptor implementation (Optional)

The `Interceptor` interface binds you to implement `onResponse` method. Instead of being resolved immediately, original promise will fall through interceptor pipeline.
Each `onResponse` call comes along with three arguments:
- `request: Request` – original request object
- `response: T` – received response
- `promise: OriginalPromise<T>` - original Promise handles (`resolve` and `reject` functions)

It allows you to intercept, analyze and modify responses before they are returned. This might be useful for scenarios like handling unauthorized responses or refreshing tokens:

```typescript
import { Interceptor } from "rest-api-helper";

const interceptor: Interceptor<Response> = {
  onResponse: async (request, response, promise) => {
    if (response.ok) {
      promise.resolve(response); // bypass
      return;
    }

    if (response.status === 401) {
      // - refresh access token
      // - reattempt original request with new headers
      // - return new response
    }

    promise.reject(new Error("Unknown error"));
  }
};
```

---

### Client Configuration

Create a new `Client` instance, configure it with a base URL, transport, interceptor (if needed) and deafault headers (if needed):

```typescript
import { Client } from "rest-api-helper";

const client = new Client<Response>("https://api.frankfurter.app")
  .setTransport(transport)
  .setInterceptor(interceptor)
  .setDefaultHeaders({ "content-type": "application/json" });
```

---

### Request Execution

Scaffold request and perform it (you can use predefined classes like `Get`, `Post` etc. or create it from scratch using `Request`):

```typescript
import { Get, Request } from "rest-api-helper";

const get = new Get("/latest")
  .setSearchParam("amount", 10)
  .setSearchParam("from", "GBP")
  .setSearchParam("to", "USD");


const request = new Request("/latest", "get")
  .setSearchParam("amount", 10)
  .setSearchParam("from", "GBP")
  .setSearchParam("to", "USD");

const response = await client.perform(request);
const parsed = await response.json();
```

---

As you might have noticed `Transport`, `Interceptor` and `Client` have generic type arguments:
```
Transport<T>
Interceptor<T>
Client<T>
```

 `T` defines the shape of each response. Since transport object responsible for performing requests, it dictates the response type. In order to be compatible, `Transport`, `Interceptor` and `Client` should share the same type.

In example described above, we used `fetch` API that is directly returned from `handle` method. Thus, generic type is native `Response`. However, we could easily move response parsing into the transport and replace native `Response` with something like this:

```typescript
import { Transport, Request } from "rest-api-helper";

type CustomResponse = {
  data: unknown;
  status: number;
};

const transport: Transport<CustomResponse> = {
  async handle(request: Request) {
    const response = await fetch(request.url, request);
    const parsed = await reponse.json();

    return { data: parsed, status: response.status } as CustomResponse;
  }
};

// ...
// const interceptor: Interceptor<CustomResponse> = {...}
// const client = new Client<CustomResponse>(...)
```

# API Reference

## `Request` Class

### Properties

- `readonly url`: `URL`
- `readonly method`: `string`
- `readonly headers`: `Record<string, string>`
- `readonly isInterceptionAllowed`: `boolean`
- `readonly body`: `BodyInit | null`

### Constructor

```typescript
constructor(path: string, method: string)
```

Creates a new request with a path and a method (GET, POST, PUT, DELETE etc.).

- `path`: a string that follows the base URL - `/users`. Can contain URL parameters, e.g. `/users/:id`
- `method`: a string that represents an HTTP method, e.g. GET, POST, PUT, DELETE. Case-insensitive.

Throws `Error` if `path` contains duplicate URL parameters. For example: `/users/:id/devices/:id`

### Methods

#### `setHeader(key: string, value: string): Request`

Appends or overrides an existing header by key

- `key`: a header name, case-insensitive
- `value`: a header value

---

#### `setHeaders(headers: Record<string, string>): Request`

Merges passed record with existing one.

- `headers`: an object with key-value pairs, where key is a header name. Keys are case-insensitive

---

#### `removeHeader(key: string): Request`

Removes a header by key, if it exists.

- `key`: a header name, case-insensitive

---

#### `setBody(data: BodyInit): Request`

Sets the body of the request.

- `data`: the request body data

---

#### `setBodyJSON(data: Record<string, unknown> | Record<string, unknown>[]): Request`

A shorthand for setting the body as JSON string, so you don't have to call `JSON.stringify` yourself.

- `data`: an object or an array of objects

---

#### `setInterceptionAllowed(allowed: boolean): Request`

Sets interception flag setting for request. True by default

- `allowed`: a boolean value indicating whether interception is allowed or not

---

#### `setAbortController(abortController: AbortController): Request`

Sets the `AbortController` for the request so you can manually abort it.

- `abortController`: an `AbortController` instance

---

#### `setUrlParam(key: string, value: string | number): Request`

Sets a URL parameter. It will replace the occurrence of `:key` in the URL path.

- `key`: parameter key
- `value`: parameter value

```
/users/:id -> setUrlParam("id", 2) -> /users/2
``` 

---

#### `setSearchParam(key: string, value: string | number | boolean | Array<string | number | boolean>): Request`

Sets a query parameter. It will append the key-value pair to the URL.

- `key`: query parameter key
- `value`: query parameter value

```
setSearchParam("name", "John") -> /users?name=John
setSearchParam("names", ["John", "Alice"]) -> /users?names[]=John&names[]=Alice
```

---

#### `setSearchParams(params: Record<string, string | number | boolean | Array<string | number | boolean>>): Request`

Sets multiple query parameters. It will append the key-value pairs to the URL.

- `params`: an object with key-value pairs representing the query parameters

```
setSearchParams({ name: "John", age: 30 }) -> /users?name=John&age=30
setSearchParams({ names: ["John", "Alice"] }) -> /users?names[]=John&names[]=Alice
```

---

## Subclasses of `Request`

- `Get`
- `Post`
- `Put`
- `Delete`
- `Patch`
- `Head`

These subclasses are convenience classes that extend `Request` and set the `method` property accordingly.

---

## `Client` Class

### Properties

- `baseURL`: `string`
- `defaultHeaders`: `Record<string, string>`

### Constructor

```typescript
constructor(baseURL: string)
```

Creates a new `Client` instance with a base URL.

- `baseUrl`: the base URL for the client

### Methods

#### `setTransport(transport: Transport<Response>): Client<Response>`

Sets the transport for the client.

- `transport`: a `Transport` object implementation

---

#### `setDefaultHeaders(headers: Record<string, string>): Client<Response>`

Sets the default headers for the client.

- `headers`: an object with key-value pairs representing the default headers

---

#### `setInterceptor(interceptor: Interceptor<Response>): Client<Response>`

Sets the interceptor for the client.

- `interceptor`: an `Interceptor` object implementation

---

#### `perform(request: Request): Promise<Response>`

Performs the given request and returns a response Promise.

- `request`: any `Request` instance including `Post`, `Get` etc.

---

## `Transport<T>` Interface

```typescript
interface Transport<T> {
  handle(request: Request): Promise<T>;
}
```

The `Transport` interface defines a single method `handle` that takes a `Request` instance and returns a Promise that resolves with the response of `T` type.

## `Interceptor<T>` Interface

```typescript
interface Interceptor<T> {
  onResponse(request: Request, response: T, promise: OriginalPromise<T>): Promise<void>;
}
```

The `Interceptor<T>` interface defines a single method `onResponse` that is called with the request, response, and the original Promise. It can be used to modify the response or handle errors.

- `request: Request` – original request object
- `response: T` – received response
- `promise: OriginalPromise<T>` - original Promise handles (`resolve` and `reject` functions)

```typescript
type OriginalPromise<T> = {
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
};
```
