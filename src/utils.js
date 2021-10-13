const APPLICATION_JSON = 'application/json';
const TEXT_PLAIN = 'text/plain';

export function copyObject(obj) {
	return JSON.parse(JSON.stringify(obj));
}

function getValue(key, value) {
	if (Array.isArray(value)) {
		return value.map(i => `${encodeURIComponent(key)}[]=${encodeURIComponent(i)}`).join('&')
	} else {
		return `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
	}
}

export function getQueryParameters(body) {
	if (!body) {
		return '';
	}
	let res = '';
	const parameters = Object.keys(body);
	for (let i = 0; i < parameters.length; ++i) {
		const parameterName = parameters[i];
		if (body[parameterName] !== undefined) {
			res += `${res.length === 0 ? '?' : '&'}${getValue(parameterName, body[parameterName])}`;
		}
	}
	return res;
}

export function getFormURLEncodedBody(body) {
	function bodyToPropertiesArray(body, prefix = '') {
		let formBody = [];
		for (const property in body) {
			if (body.hasOwnProperty(property)) {
				const key = prefix ? `${prefix}[${property}]` : property;
				const encodedKey = encodeURIComponent(key);
				switch (typeof body[property]) {
					case 'object':
						if (Array.isArray(body[property])) {
							body[property].each((val) => {
								const encodedValue = encodeURIComponent(val);
								formBody.push(encodedKey + '[]=' + encodedValue);
							}, this);
						} else {
							formBody = formBody.concat(bodyToPropertiesArray(body[property], property));
						}

					case 'function':
						break;
					case 'undefined':
						break;
					default:
						const encodedValue = encodeURIComponent(body[property]);
						formBody.push(encodedKey + '=' + encodedValue);
				}
			}
		}
		return formBody;
	}

	return bodyToPropertiesArray(body).join('&');
}

export function isTextPlain(headers) {
	return (headers['content-type'].toLowerCase()).indexOf(TEXT_PLAIN) !== -1;
}

export function isApplicationJson(headers) {
	return (headers['content-type'].toLowerCase()).indexOf(APPLICATION_JSON) !== -1;
}

export function isBodyNotAllowed(method) {
	const lowerCaseMethod = method.toLowerCase();
	return lowerCaseMethod === 'get' || lowerCaseMethod === 'head';
}

export function generateTag(length) {
	let result = '';
	let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

export function fillString(str) {
	return str

	// disabled so far. annoying
	let parts = str.split(' ');
	return parts.map((part, index) => {
		const partCapacity = (index === 0 || index === 2 ? 14 : 40);
		for (let i = partCapacity - part.length; i > 0; i--) {
			part += ' ';
		}

		return part;
	}).join('');
}

export function getCurl(request) {
	let curl = `curl -X ${request.method} \\\n'${request.url}' `;
	for (const header in request.headers) {
		curl += `\\\n -H '${header}: ${request.headers[header]}' `;
	}
	if (request.body) {
		curl += `-d '${request.body}'`;
	}
	return curl;
}
