import { RestApiHelper } from "../src/controller";
import 'chai/register-should';
const assert = require('assert');

describe('_getBody', function() {
	it('should return null when method === get or GET or head or HEAD', function() {
		assert.equal(RestApiHelper._getBody('get', {}), null);
		assert.equal(RestApiHelper._getBody('GET', {}), null);
		assert.equal(RestApiHelper._getBody('head', {}), null);
		assert.equal(RestApiHelper._getBody('HEAD', {}), null);
	});
});