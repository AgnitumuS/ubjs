/**
 * HTTPS client.
 * @module https
 */
 
let http = require('http');

exports.request = function request(options) {
	options.useHTTPS = true;
	return http.request(options);
}
exports.get = function request(options) {
	options.useHTTPS = true;
	return http.get(options);
}

