import { RestApiHelper } from "../src/RestApiHelper";
import 'chai/register-should';
import 'chai/register-assert';
import 'chai/register-expect';

describe('_getBody', function() {

	it('should return null when method === get', function() {
		assert.equal(RestApiHelper._getBody('get', {}), null);
	});

	it('should return null when method === GET', function() {
		assert.equal(RestApiHelper._getBody('GET', {}), null);
	});

	it('should return null when method === head', function() {
		assert.equal(RestApiHelper._getBody('head', {}), null);
	});

	it('should return null when method === HEAD', function() {
		assert.equal(RestApiHelper._getBody('HEAD', {}), null);
	});

	it('should return second arg in JSON when method !== get or GET or head or HEAD', function() {
		assert.equal(RestApiHelper._getBody('post', {}), '{}');
	});

});

describe('_getMethod', function() {

	it('should return method from config if it match RFC 2616 specification', function() {
		assert.equal(RestApiHelper._getMethod('get'), 'GET');
	});

	it(`should return Error if argument doesn't match RFC 2616 specification`, () => {
		(function() {
			RestApiHelper._getMethod('test')
		}).should.Throw(Error, 'Invalid method')
	});

});

describe('_decorate', function() {
	it('should return json if status means success', function() {
		RestApiHelper.configure({ "successStatus": [200] });
		assert(RestApiHelper._decorate({ status: 200, body: {} }), {})
	});

	it(`should return RequestError status doesn't means success`, () => {
		(function() {
			RestApiHelper.configure({ "successStatus": [] });
			RestApiHelper._decorate({ status: 200, body: {} })
		}).should.Throw(Error)
	});
});

describe('_isSuccess', function() {

	it('should return true if status belong _config.successStatus array', function() {
		RestApiHelper.configure({ "successStatus": [200] });
		assert.equal(RestApiHelper._isSuccess(200), true);
	});

	it('should return false if status belong _config.successStatus array', function() {
		RestApiHelper.configure({ "successStatus": [] });
		assert.equal(RestApiHelper._isSuccess(200), false);
	});

});

describe('fetch', function() {
	it('should return properly body request in JSON', async function() {

		RestApiHelper.configure({ "successStatus": [200], "baseURL": "" });

		const response = await RestApiHelper.fetch('get', 'http://httpbin.org/get');
		response.should.be.a('object');
	});
});
