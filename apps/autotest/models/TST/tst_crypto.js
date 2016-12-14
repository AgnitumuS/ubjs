'use strict'

var me = tst_crypto

me.entity.addMethod('doTest')

/**
 * @param {ubMethodParams} ctx
 */
me.doTest = function (ctx) {
  var signature, signInfo, cert, certInfo, rStat, dat,
    iitCrypto = require('iitCrypto'),
    fs = require('fs'),
    path = require('path'),
    thCode = ctx.mParams.execParams.code

    // var fileT = require('fs').readFileSync(relToAbs(process.cwd(), 'fixtures\file1.pdf'), {encoding: 'bin'});

  var fixtures = ['file1.pdf', 'file2.pdf', 'file3.pdf'].map(function (fileName) {
    return fs.readFileSync(path.join(__dirname, '_autotest', 'fixtures', fileName), {encoding: 'bin'})
  })
  try {
    rStat = iitCrypto.init('')
    console.log(thCode, 'init IIT', rStat)
    rStat = iitCrypto.readPkFromFile(path.join(__dirname, '_autotest', 'iitKey', 'Key-6.dat'), '12345677')
    console.log(thCode, 'init readPkFromFile', rStat)
        // console.log(iitCrypto.getStatus());
    fixtures.forEach(function (fileDat) {
      signature = iitCrypto.signData(fileDat)
      console.log(thCode, 'signData OK')
      signInfo = iitCrypto.verifyData(signature, fileDat)
      console.log(thCode, 'verifyData OK')
      if (!signInfo.success) {
        throw new Error(signInfo.message)
      }
    })
    for (var i = 0; i < 10; i++) {
      dat = fixtures[Math.floor(Math.random() * fixtures.length)]
      signature = iitCrypto.signData(dat)
      signInfo = iitCrypto.verifyData(signature, dat)
      if (!signInfo.success) {
        throw new Error(signInfo.message)
      }
    }
        // console.log(signInfo);
    cert = iitCrypto.getOwnCertificate()
    certInfo = iitCrypto.parseCertificate(cert)
    console.log(thCode, 'OK')
        // console.log(certInfo);
        // ctx.mParams.makeLog =
  } catch (err) {
    console.log(thCode, 'failure')
    throw err
  }
}

