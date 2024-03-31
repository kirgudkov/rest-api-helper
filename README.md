`rest-api-helper` is a lightweight package that simplifies and abstracts the process of making HTTP requests.
It provides a modular and extensible approach, allowing to define custom transport mechanisms, intercept and modify responses, and configure requests with ease. 

The library promotes separation of concerns and offers a structured API for creating requests, setting headers, body, URL and query parameters.

# Installation

Install the package using npm or yarn:

```bash
npm install rest-api-helper
```
```bash
yarn add rest-api-helper
```

# Usage

To perform any request it is required to:

- Define the way you're going to communicate (transport);
- Create and configure client object to glue everything together (base url, default headers, transport etc);
- Create request object;
- Perform the request using client;

---

### Transport implementation.

The `Transport` interface obliges you to implement one single method `handle`. It can do whatever you want whether it's `fetch` or `XHR` or `setTimeout` mock. In most cases, you're going to use the fetch API:

```typescript
import { Transport } from "rest-api-helper";

const transport: Transport<Response> = {
  handle(request) {
    return fetch(request.url, request);
  }
};
```

---

### Interceptor implementation (Optional).

The `Interceptor` interface binds you to implement `onResponse` method. Instead of being resolved immediately, original promise will fall through interceptor pipeline.
Each `onResponse` call comes along with three arguments:
- `request: Request`
- `response: T`
- `promise: OriginalPromise<T>` - not the Promise itself but the object with resolve and reject functions: `{ resolve, reject }`

It allows you to intercept, analyze and modify responses before they are returned. This is useful for scenarios like handling unauthorized responses and refreshing tokens:

```typescript
import { Interceptor } from "rest-api-helper";

const interceptor: Interceptor<Response> = {
  onResponse: async (request, response, promise) => {
    if (response.ok) {
      promise.resolve(response); // bypass
      return;
    }

    if (response.status === 401) {
      // refresh token, reattempt request, and return result
    }

    promise.reject(new Error("Unknown error"));
  }
};
```

---

### Client Configuration

Create a new `Client` instance, configure it with the base URL, transport and interceptor (if needed):

```typescript
import { Client } from "rest-api-helper";

const client = new Client<Response>("https://api.frankfurter.app")
  .setTransport(transport)
  .setInterceptor(interceptor);
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

In example described above, we used `fetch` API that is directly returned from `handle` method. Thus, generic type is native `Response`. But we could easily move response parsing into transport and replace native `Response` with something else:

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

Throws `Error` if `path` contains duplicate URL parameters, e.g. `/users/:id/devices/:id`

### Methods

#### `setHeader(key: string, value: string): Request`

Appends or overrides an existing header by key

- `key`: a header name, case-insensitive
- `value`: a header value

---

#### `setHeaders(headers: Record<string, string>): Request`

Merge passed record with existing one.

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

A shorthand for setting the body as JSON, so you don't have to call `JSON.stringify` yourself.

- `data`: an object or an array of objects

---

#### `setInterceptionAllowed(allowed: boolean): Request`

Set interception flag setting for request. True by default

- `allowed`: a boolean indicating whether interception is allowed or not

---

#### `setAbortController(abortController: AbortController): Request`

Sets the `AbortController` for the request so you can manually abort it.

- `abortController`: an `AbortController` instance

---

#### `setUrlParam(key: string, value: string | number): Request`

Sets a URL parameter. It will replace the occurrence of `:key` in the URL path.

- `key`: the parameter key
- `value`: the parameter value

```
/users/:id -> setUrlParam("id", 2) -> /users/2
``` 

---

#### `setSearchParam(key: string, value: string | number | boolean | Array<string | number | boolean>): Request`

Sets a query parameter. It will append the key-value pair to the URL.

- `key`: the query parameter key
- `value`: the query parameter value

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
constructor(baseURL: string, transport?: Transport<Response>)
```

Creates a new `Client` instance with a base URL and an optional transport.

- `baseUrl`: the base URL for the client
- `transport` (optional): a `Transport` instance

### Methods

#### `setTransport(transport: Transport<Response>): Client<Response>`

Sets the transport for the client.

- `transport`: a `Transport` instance

---

#### `setDefaultHeaders(headers: Record<string, string>): Client<Response>`

Sets the default headers for the client.

- `headers`: an object with key-value pairs representing the default headers

---

#### `setInterceptor(interceptor: Interceptor<Response>): Client<Response>`

Sets the interceptor for the client.

- `interceptor`: an `Interceptor` instance

---

#### `perform(request: Request): Promise<Response>`

Performs the given request and returns a Promise that resolves with the response.

- `request`: a `Request` instance

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

- `request`: the `Request` instance
- `response`: the response data of a `T` type
- `promise`: the original Promise

```typescript
type OriginalPromise<T> = {
  resolve: (value: T) => void, reject: (reason?: unknown) => void
};
```

This interface allows you to define custom interceptors for handling responses.

