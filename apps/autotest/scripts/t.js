const crypto = require('crypto')
const expected =
      '\u0010\u0041\u0052\u00c5\u00bf\u00dc\u00a0\u007b\u00c6\u0033' +
      '\u00ee\u00bd\u0046\u0019\u009f\u0002\u0055\u00c9\u00f4\u009d'; 

console.log(Buffer.from(expected, 'latin1'))

console.log(crypto.createHmac('sha1', 'key').update('data').digest('buffer'))