## Installation

    npm install rest-api-helper

## Usage

  ```ts
import { Client, Request, Transport, Interceptor } from "rest-api-helper";

// Implement Transport interface. In most cases you will probably use fetch
const transport: Transport<Response> = {
  handle(request) {
    return fetch(request.url, request);
  }
};

// If you want to intercept response, implement Interceptor interface
// All responses will be passed through interceptor before they are returned
const interceptor: Interceptor<Response> = {
  onResponse: async (response) => {
    if (response.status === 401) {
      // Do things
    }

    return response;
  }
};

// Create client. Client holds base url, default headers and interceptors
// And it performs requests using transport
const client = new Client<Response>("https://api.frankfurter.app")
  .setDefaultHeaders({
    "content-type": "application/json",
    "accept": "application/json"
  })
  .setTransport(transport)
  .setInterceptor(interceptor);

// Scaffold your request. You can manipulate request before it is performed
const request = new Request("/latest", "get")
  .setSearchParam("amount", 10)
  .setSearchParam("from", "GBP")
  .setSearchParam("to", "USD");

const response = await client.perform(request);
const parsed = await response.json();
```
