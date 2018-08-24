
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
      res = `${res.length === 0 ? '?' : '&'}${getValue(parameterName, body[parameterName])}`;
    }
  }
  return res;
}
