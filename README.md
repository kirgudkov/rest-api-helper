`rest-api-helper` is a tiny lightweight package that abstracts the process of making HTTP requests.

# Installation

```
yarn add rest-api-helper
```

# Usage

To perform any request it is required to:

- Define _transport_ aka the way you're going to communicate
- Configure _client_ to glue everything together (base url, headers, transport etc)
- Create _request_ object

---

### Transport implementation

The `Transport` interface obliges you to implement method `perform`. It can do whatever you want whether it's `fetch` or `XHR` or `setTimeout` mock. In most cases, you're
probably going to use the fetch API:

```typescript
class FetchTransport implements Transport<Response> {
  perform(request) {
    return fetch(request.url.href, request);
  }
};
```

---

### Interceptor implementation (Optional)

The `Interceptor` interface binds you to implement `onResponse` method.

Instead of being resolved immediately, original promise will fall through the interceptors pipeline.
Each `onResponse` call comes along with three arguments:

- `request: Request` – original request object
- `response: T` – received response
- `client: Client<T>` - original client instance that was used to perform request. Might be useful to retry intercepted or perform another request

It allows you to

- intercept, analyze and modify responses before they are passed down the chain
- retry failed requests
- perform another requests

This might be useful for scenarios like handling 401 statuses, refreshing tokens and retying:

```typescript
class UnauthorizedInterceptor implements Interceptor<Response> {
  // ...
  async onResponse(request, response, client) {
    if (response.status === 401) {
      // Refresh token
      const refreshRequest = new Post(Endpoint.refresh)
        .setBodyJSON({ "refreshToken": refreshToken });

      const { accessToken } = await client.perform(refreshRequest);
      request.setHeader("Authorization", `Bearer ${accessToken}`);
      return client.perform(request);
    }

    // Or pass the response down the chain
    return response;
  }
};

class RetryInterceptor implements Interceptor<Response> {
  // ...
  async onResponse(request, response, client) {
    if (!response.ok) {
      try {
        // Request counts attempts and throws an error if it exceeds the limit
        const retryResponse = await client.perform(request);

        if (retryResponse.ok) {
          return retryResponse;
        }
      }
      catch (error) {
        // Maximum attempts reached
      }
    }

    return response;
  }
};
```

---

### Client Configuration

Create a new `Client` instance, configure it with a base URL, transport, interceptor/s (if needed) and default headers (if needed):

```typescript
const fetchTransport = new FetchTransport();
const unauthorizedInterceptor = new UnauthorizedInterceptor();
const retryInterceptor = new RetryInterceptor();

const client = new Client<Response>(fetchTransport, "https://api.frankfurter.app")
  .setInterceptor(unauthorizedInterceptor)
  .setInterceptor(retryInterceptor)
  .setDefaultHeaders({ "content-type": "application/json" });
```

---

### Request Execution

Scaffold request and perform it (you can use predefined classes like `Get`, `Post` etc. or create it from scratch using `Request`):

```typescript
const get = new Get("/latest")
  .setSearchParam("amount", 10)
  .setSearchParam("from", "GBP")
  .setSearchParam("to", "USD");


const request = new Request("get", "/latest")
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

`T` defines the shape of each response. Since transport object responsible for performing requests, it dictates the response type. In order to be compatible, `Transport`,
`Interceptor` and `Client` should share the same type.

In example described above, we used `fetch` API that is directly returned from `perform` method. Thus, generic type is native `Response`. However, we could easily move response
parsing into the transport and replace native `Response` with something like this:

```typescript
type CustomResponse = {
  data: unknown;
  status: number;
};

class FetchTransport implements Transport<CustomResponse> {
  async perform(request: Request): CustomResponse {
    const rawResponse = await fetch(request.url, request);

    // or .text() or whatever based on content-type header
    const parsedResponse = await rawResponse.json();

    return {
      data: parsedResponse,
      status: rawResponse.status,
    };
  }
};
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

```
constructor(method: string, path: string)
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

#### `setMaxAttempts(maxAttempts: number): Request`

Sets the maximum number of attempts for the request. Default is 3.

- `maxAttempts`: a number representing the maximum number of attempts

---

#### `setBaseDelay(baseDelay: number): Request`

Sets the base delay in milliseconds between attempts. Each attempt will increase the delay by the base delay multiplied by the attempt number.
For example, if the base delay is 1000ms and the max attempts is 3, the delays will be: 0ms, 1000ms and 2000ms.
First attempts is always executed immediately.

- `baseDelay`: a number representing the base delay in milliseconds

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

These are convenience classes that extend `Request` and set the `method` property accordingly.

---

## `Client` Class

### Properties

- `baseURL`: `string`
- `defaultHeaders`: `Record<string, string>`

### Constructor

```
constructor(transport: Transport<Response>, baseURL: string)
```

Creates a new `Client` instance with a base URL.

- `transport`: a `Transport` implementation
- `baseUrl`: the base URL for the client

### Methods

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
  perform(request: Request): Promise<T>;
}
```

The `Transport` interface defines a single method `perform` that takes a `Request` instance and returns a Promise that resolves with the response of `T` type.

## `Interceptor<T>` Interface

```typescript
interface Interceptor<T> {
  onResponse(request: Request, response: T, client: Client<T>): Promise<T>;
}
```

The `Interceptor<T>` interface defines a single method `onResponse` that is called with the request, response, and the original Promise. It can be used to modify the response or
handle errors.

- `request: Request` – original request object
- `response: T` – received response
- `client: Client<T>` - original client instance that was used to perform request
