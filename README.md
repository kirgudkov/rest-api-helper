# REST API Helper
Simple proxy layer for JavaScript `fetch()`. It helps do some http-requests excluding ugly boilerplate code and pretty cool logs support
## Installation
    npm i rest-api-helper
## Usage
First thing first you need to configure helper.   
  - Create your_config_name.json.
  - Define basic things for fetch:
  
  It's like a
  ```
{
    "baseURL": "http://your.api.base.url/api/v1/",
    "logger": true
    "headers": {},
    "statusDescription": {
        "200": "OK",
        "401": "Invalid API token"
    },
    "successStatus": [
        200
    ],
    "request": {
       "getSomething": {
          "method": "get",
          "url": "something/get",
          "headers": {
             "Content-Type": "application/json",
             "Authorization": ""
          }
       }
    }
}
```
 - Put your request's options in "request" property. 
 Leave dynamic options as empty properties, like "Authorization".
 - Call `RestApiHelper.configure(require('path_to_your_config.json'));` before `fetch()`
 - Define yor API methods. Example:
 ```
async getSomething(request: SomeRequest) {

	RestApiHelper.setHeaders({
		"Authorization": request.token,
	}, 'getSomething');
	
	let response = await RestApiHelper.fetch('getSomething');
	return new SomeResponse(response);
}
```
 - Then call `getSomething()` wherever you need. Example:
 ```
getSomething(new SomeRequest(token)).then((response: SomeResponse) => {
	// do something
}).catch((error) => console.log(error));
```
#### Note:
> We recommend using data models for greater code purity. Like we do - pass new SomeRequest() and return new SomeResponse()
 - If you need logs, set `logger: true` in config.json (default `false`)
 - `multipart/form-data` example:
 ```
async uploadPhoto(file: File) {

    let formData = new FormData();
    formData.append('file', {
        uri: file.getUri()
    });
    formData.append('name', file.getName());
    
    RestApiHelper.setBody(formData, 'uploadFile');
    
    let response = await RestApiHelper.fetch('uploadFile');
    return new Response(response);
}
```
> Don't forget declare `"Content-type": "multipart/form-data"` header for this kind of request
## Important:
- If you need use a specific url for some requests, 
just put full url string in "url" property, like:
```
"getSomething": {
   "method": "get",
   "url": "http://your.api.specific.url/api/v1/something/get",
   "headers": {
      "Content-Type": "application/json",
      "Authorization": ""
   }
}
```
- If request throws error associated with an unsuccessful status (like 500), you can parse it and handle. For example:
```
...}).catch((error) => {
    console.log(error.name); // "bad" status, like 500
    console.log(error.description); // desc, like "Internal server error"
    console.log(JSON.parse(error.message)); // response body, like {error: 'Internal server error'}
});
```

## TODO

- [X] GET, POST, DELETE etc. support
- [X] multipart/form-data support
- [X] Logger
- [X] Specific urls
- [ ] XML support
