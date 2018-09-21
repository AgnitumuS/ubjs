console.log('CRT model required')

/*
// source: http://stackoverflow.com/a/11058858
function str2ab(str) {
  var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

const password = '100000'; // Change to actual password for Key-6.dat file
const data = str2ab('This is a test data');

iitCrypto = require('@ub-d/iit-crypto');
iitCrypto.init();
let keyPath = relToAbs(process.cwd(), 'Key-6.dat')
console.log(keyPath)
iitCrypto.readPkFromFile(keyPath, password); // Put Key-6.dat file to the working folder
// sign data
signature = iitCrypto.signData(data);
// verify data
signInfo = iitCrypto.verifyData(signature, data);
if (!signInfo.success){
  throw new Error(signInfo.message);
}
console.log(signInfo);
cert = iitCrypto.getOwnCertificate();
certInfo = iitCrypto.parseCertificate(cert);
console.log(certInfo);
*/

const cryptoService = require('@ub-d/crypto-service').cryptoService
App.registerEndpoint('cryptoService', cryptoService, false)
