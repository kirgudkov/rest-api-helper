
export function copyObject(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function getValue(key, value) {
  return `${key}=${value}`;
}

export function getQueryParameters(obj) {
  let res = '';
  const keys = Object.keys(obj);
  for (let j = 0; j < keys.length; j += 1) {
    const i = keys[j];
    if (obj[i] !== undefined) {
      if (res === '') {
        res = getValue(i, obj[i], transformArrays);
      } else {
        res += `&${getValue(i, obj[i], transformArrays)}`;
      }
    }
  }
  return res;
}
