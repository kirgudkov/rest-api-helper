# REST API Helper
Simple proxy layer for JavaScript `fetch()`. It helps do some http-requests excluding ugly boilerplate code and pretty cool logs support
## Installation
    npm i rest-api-helper
## Usage
First thing first you need to configure helper.   
  - Create your_config_name.json.
  - Define basic things for fetch:
  
  It's like a
  ```$xslt
{
    "baseURL": "http://your.api.base.url/api/v1/",
    "headers": {},
    "statusDescription": {
        "200": "OK",
        "401": "Invalid API token"
    },
    "successStatus": [
        200
    ],
    "logger": true
}
```
 - Call `RestApiHelper.configure(require('path_to_your_config.json'));` before `fetch()`
 - Define yor API methods. Example:
 ```$xslt
async getSomething(request: Request) {
	// redefine property "headers" at you config.json
	config.headers = {
		"Authorization": request.getToken(),
	};
	let response = await RestApiHelper.fetch('get', 'something/get');
	return new Response(response);
}
```
 - Call `getSomething()` wherever you need. Example:
 ```$xslt
getSomething(new Request(token)).then((response) => {
	// do something
}).catch((error) => console.log(error));
```
#### Note:
> We recommend using data models for greater code purity. Like we do - pass new SomeRequest() and return new SomeResponse()
 - If you need logs, set `logger: true` in config.json (default `false`)
 - `multipart/form-data` example:
 ```$xslt
async uploadPhoto(file: File) {
    let data = new FormData();
    
    data.append('file', {
        uri: file.getUri()
    });
    
    data.append('name', file.getName());
    
    config.headers = {
      "content-type": "multipart/form-data"
    };
    
    let response = await RestApiHelper._fetch('post', '/upload', data);
    return new Response(response);
}
```
## Important:
- baseURL is required. But, if you need use a specific url for some requests, you should pass full url string as argument, like:
```$xslt
RestApiHelper.fetch('post', 'https://some.api.full.url/data', data);
```
- If request throws error associated with an unsuccessful status (like 500), you can parse it and handle. For example:
```$xslt
...
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
