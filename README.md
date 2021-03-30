# API Helper
Wrapped JavaScript `fetch()`. It helps do some network things with pretty cool logs and without ugly boilerplate code

![npm-publish](https://github.com/KirillGudkov/rest-api-helper/actions/workflows/npm-publish.yml/badge.svg)

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

> ##### Changelog (0.1.5):
> Response interception:
> there is two new interfaces `Interceptor` and `OnInterceptDelegate`
> for example see [Interception](#interception)

> ##### Changelog (0.1.54):
> added AbortController to abort fetch
> for example see [AbortController](#AbortController)

## Installation
    npm install rest-api-helper
    or
    yarn add rest-api-helper
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
```typescript
import { RestApiHelper } from 'rest-api-helper';
import config from './config';

class NetworkManager { 

    constructor() {
        RestApiHelper.builder()
            .withConfig(require('config.json')));
    }
    
     public getSomethingById<T>(body: Body, id: string, token: string): Promise<Response<T>> {
        try {
           return await RestApiHelper.build<T>('getSomethingById')
              .withBody(body)
              .withUrlParam('id', id)
              .withHeaders({'Authorization': token})
              .fetch();
         } catch (exception) {
            throw new CustomException(exception);
         }
    }

    public async getSomethingWithQuery<T>(userId, token): Promise<Response<T>> {
        try {
          return await RestApiHelper.build<T>('getSomethingWithQuery')
            .withQueryParams({ userId })
            .withHeaders({'Authorization': token})
            .fetch()
        } catch(exception) {
          throw new CustomException(exception);
        }
    }
}
```
### Interception
- Create a class implementing `Interceptor`
- Specify the statuses you want to intercept:

```typescript
import { Interceptor, OnInterceptDelegate } from 'rest-api-helper';

export class NetworkResponseInterceptor implements Interceptor {

  public statuses = [401]

  public delegate?: OnInterceptDelegate
}
```

### AbortController

```typescript
let controller = new AbortController()

try {
  return await RestApiHelper.build<T>('getSomethingWithQuery')
    .withAbortController(controller)
    .fetch()
} catch(exception) {
  throw new CustomException(exception);
}

//...

controller.abort()
```

Then implement OnInterceptDelegate in your networking layer:

```typescript
import { Interceptor, OnInterceptDelegate } from 'rest-api-helper';

export class NetworkManager implements OnInterceptDelegate {
  
  private interceptor: Interceptor = new NetworkResponseInterceptor();

  constructor() {
    this.interceptor.delegate = this;
  }

  RestApiHelper.builder()
     .withInterceptor(this.interceptor)
     .withConfig(api_config);

  public async onIntercept(request: Request<any>, resolver: (value: PromiseLike<any> | any) => void, response: Response<any>) {
    // each intercepted response with the specified status
    // fall back here with all data you need (request, response and promise resolver)
    // intercepted request will be deferred until you call resolver()
    // this can be used to update the token - call the refreshMyToken() function and then call
    // resolver ()
    
    // eg:
    this.refresh<RefreshResponse>()
      .then(async (refreshResponse) => {

         const deferred = await request // <-- here your intercepted request will be called again with new access token
           .withHeaders({ Authorization: `Bearer ${refreshResponse.body.access_token}` })
           .fetch();
 
         resolver(deferred); // <-- here your intercepted request will be resolved with new response
       })
       .catch(exception => {
         throw new ...
       });
  }
}
``` 
> Response contains body and headers. If You need to know about response headers, just call `response.headers` besides `response.body`
 - Then call `getSomethingById()` wherever you need. Example:
 ```typescript
networkManager.getSomethingById<ResponseDataObject>(body, id, token)
    .then(response => { // response is ResponseDataObject because generic
	    // do something
    })
    .catch(exception => { /* handle error */ });
```

> - Statuses that are not listed as `“successStatus”` in `config.json` will be thrown into `catch()`

### `multipart/form-data` example:
 ```javascript
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
```javascript
config.logger = __DEV__ && Boolean(global.origin);

RestApiHelper.builder()
  .withConfig(config);
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
```javascript
...}).catch(error => {
    console.log(error.name); // "bad" status, like 401
    console.log(error.description); // description, like "Invalid token"
    console.log(error.message); // response body, for example:  {error: 'Authorization has expired'}
});
```


### Request creating without description in config file: 
```javascript
const request = RestApiHelper.post(url) // or get, put ...
```
Now you can use all request's methods, like `withHeaders`, `withBody` and etc.
