# REST API Helper
Simple wrapper for JavaScript `fetch()`. It helps do some network things with pretty cool logs and without ugly boilerplate code

> ##### Changelog (0.1.0):
> - few url param support (f.e: `'get/{type}/{id}'`)
> - "headers" property is not required in `config.json`
> - `text/plain` responses are available

> ##### Breaking changes (0.1.0):
> - New API (method names, method chaining template. See below). 

> ##### Changelog (0.1.3):
> - fix of query parameters encoding
> - query parameters support for all queries types (`post`, `get`,...)
> - api for response interception
> - mark `RestApiHelper.configure` as deprecated. It's will be removed in next version. Use `RestApiHelper.withConfig` instead 
> - mark `Request.withParam` as deprecated. It's will be removed in next version. Use `Request.withUrlParam` instead

## Installation
    npm install rest-api-helper
## Usage
First thing first you need to configure helper:   
  - Create `your_config.json`
  - Define basic things:
  
  ```
{
    "baseURL": "http://your.api.base.url/api/v1/",
    "logger": true
    "headers": {
        "content-Type": "application/json"
    },
    "statusDescription": {
        "200": "OK",
        "401": "Invalid API token"
    },
    "successStatus": [
        200
    ],
    "request": {
       "getSomethingWithQuery": {
          "method": "get",
          "url": "something/get"
       },
       "getSomethingById": {
          "method": "get",
          "url": "something/get/{id}"
       }
    }
}
```
 - Declare your requests in "request" property. 
 - Call `RestApiHelper.builder().withConfig(require('your_config.json'));` first
 - Define yor API class. Example:
 ```
import { RestApiHelper } from 'rest-api-helper';
import config from './config';

class Api { 
    constructor() {
        RestApiHelper.configure(require('config.json'));
    }
    
    async getSomethingById(body, id, token) {
        const response = await RestApiHelper
            .build('getSomethingById')
            .withBody(body)
            .withUrlParam('id', id)
            .withHeaders({'Authorization': token})
            .fetch();
        return new SomeResponse(response.body);
    }

    async getSomethingWithQuery(userId, token) {
        const response = await RestApiHelper
            .build('getSomethingWithQuery')
            .withQueryParams({ userId })
            .withHeaders({'Authorization': token})
            .fetch();
        return new SomeResponse(response.body);
    }
}
```
- handle errors with interceptor:
```
export class InterceptorImpl {
  constructor() {
  }

  public static buildErrorMessage(response) {
    if (response.body.error && response.body.message) {
      return `${response.body.error}: ${response.body.message}`;
    }
    return 'Server error';
  }

  public delegate(response) {
    if (response.status > 200) {
      alert(Interceptor.buildErrorMessage(response));
    }
  }
}

/*
 * and use withInterceptor when build RestApiHelper
 */
 RestApiHelper.builder().withInterceptor(new InterceptorImpl()).withConfig(config);
```
#### Note:
> Response contains body and headers. If You need to know about response headers, just call `response.headers` besides `response.body`
 - Then call `getSomethingById()` wherever you need. Example:
 ```
api.getSomethingById(body, id, token).then(response => {
	// do something
}).catch(error => { /* handle error */ });
```

> - Statuses that are not listed as `“successStatus”` in `config.json` will be thrown into `catch()`

####`multipart/form-data` example:
 ```
async uploadPhoto(file: File) {
    const formData = new FormData();
    
    formData.append('file', {
        uri: file.getUri()
    });
    
    formData.append('name', file.getName());
    
    const response = await RestApiHelper
     	.build('uploadPhoto')
     	.withBody(formData)
     	.fetch();
    return new Response(response.body);
}
```
> Don't forget declare `"content-type": "multipart/form-data"` header for this kind of request

```
"uploadPhoto": {
    "method": "post",
     "url": "/upload",
     "headers": {
        "content-type": "multipart/form-data"
     }
}
      
```   
##
### Logger:
 - If you need logs (which are pretty cool btw :)), set `logger: true` in config.json
##### Important for React-Native:
> Logger might produce crashes at release builds or in debugger-off mode. 
Because that kind of logs supported only in V8 engine. We recommend use this hack before `RestApiHelper.config()`:
```
config.logger = __DEV__ && Boolean(global.origin);
RestApiHelper.builder().withConfig(config);
```
> Then logger will be working only in dev mode and debug-on mode   

## Specific url:
- If You need use a specific url for some requests, 
just put full url string in "url" property, like:
```
"getSomething": {
   "method": "get",
   "url": "http://your.api.specific.url/api/v1/something/get"
}
```
- If request throws error associated with an unsuccessful status (like 500), You can parse it and handle. For example:
```
...}).catch(error => {
    console.log(error.name); // "bad" status, like 401
    console.log(error.description); // description, like "Invalid token"
    console.log(error.message); // response body, for example:  {error: 'Authorization has expired'}
});
```
