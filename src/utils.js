export function copyObject(obj) {
	return JSON.parse(JSON.stringify(obj));
}

function getValue(key, value) {
	return `${key}=${value}`;
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

	let formBody = [];

	for (let property in body) {
		if (body.hasOwnProperty(property)) {
			let encodedKey = encodeURIComponent(property);
			let encodedValue = encodeURIComponent(body[property]);
			formBody.push(encodedKey + "=" + encodedValue);
		}
	}

	return formBody.join("&");
}
