# REST API Helper
Simple proxy layer for JavaScript `fetch()`. It helps do some http-requests excluding ugly boilerplate code and pretty cool logs support
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
       "getSomethingById": {
          "method": "get",
          "url": "something/get/{id}"
       }
    }
}
```
 - Declare your requests in "request" property. 
 - Call `RestApiHelper.configure(require('your_config.json'));` first
 - Define yor API methods. Example:
 ```
async getSomethingById(body, id, token) {
	const response = await RestApiHelper
    	.build('getSomethingById')
    	.withBody(body)
    	.withParam('id', id)
    	.withHeaders({'Authorization': token})
    	.fetch();
	return new SomeResponse(response.body);
}
```
#### Note:
> Response contains body and headers. If You need to know about response headers, just call `response.headers` besides `response.body`
 - Then call `getSomethingById()` wherever you need. Example:
 ```
getSomething(new SomeRequest(token)).then(response => {
	// do something
}).catch(error => { /* handle error */ });
```
### Logger:
 - If you need logs (which are pretty cool btw :)), set `logger: true` in config.json
##### Important for React-Native:
> Logger might produce crashes at release builds or in debugger-off mode. 
Because that kind of logs supported only in V8 engine. We recommend use this hack before `RestApiHelper.config()`:
```
config.logger = __DEV__ && Boolean(global.origin);
RestApiHelper.configure(config);
```
> Then logger will be working only in dev mode and debug-on mode
##
 - `multipart/form-data` example:
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
> Statuses not specified as "successStatus" in config.json will appears at `catch()` 
