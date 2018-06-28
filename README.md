# REST API Helper
Simple proxy layer for JavaScript `fetch()`. It helps do some http-requests excluding boilerplate code.
## Installation
    npm i rest-api-helper
## Usage
First thing first you need to configure helper.   
  - Create file your_config_name.json.
  - Define your basic things for fetch:
  
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
    ]
}
```
 - Call `RestApiHelper.configure(require('path_to_your_config.json'));`
 - Define yor API methods. Example:
 ```$xslt
async getSomething(request: Request) {
	// redefine property "headers" at you config.json
	config.headers = {
		"Content-Type": "application/json",
		"Authorization": request.getToken(),
	};
		
	let response = await RestApiHelper._fetch('get', 'something/get');
	return new Response(response);
}
```
 - Call `getSomethisng()` wherever you need. Example:
 ```$xslt
getSomething(new Request(token)).then((response) => {
	// do something
}).catch((error) => console.log(error));
```
## Important:
baseURL is required