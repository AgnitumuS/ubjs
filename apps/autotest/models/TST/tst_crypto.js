let me = tst_crypto

me.entity.addMethod('doTest')
const iitCrypto = require('@ub-d/iit-crypto')
const fs = require('fs')
const path = require('path')

/**
 * @param {ubMethodParams} ctx
 */
me.doTest = function (ctx) {
  let thCode = ctx.mParams.execParams.code
  let mParams = ctx.mParams
  let outParamNum = 1

  let fixtures = ['file1.pdf', 'file2.pdf', 'file3.pdf'].map(function (fileName) {
    return fs.readFileSync(path.join(__dirname, '_autotest', 'fixtures', fileName), {encoding: 'bin'})
  })
  try {
    let rStat = iitCrypto.init('D:\\SVN\\M3\\trunk\\06-Source\\libs_vendor\\iit')
    console.log(thCode, 'init IIT', rStat)
    rStat = iitCrypto.readPkFromFile(path.join(__dirname, '_autotest', 'iitKey', 'Key-6.pfx'), '12345678')
    console.log(thCode, 'init readPkFromFile', rStat)
    // console.log(iitCrypto.getStatus());
    fixtures.forEach(function (fileDat) {
      let signature = iitCrypto.signData(fileDat)
      console.log(thCode, 'signData OK')
      let signInfo = iitCrypto.verifyData(signature, fileDat)
      console.log(thCode, 'verifyData OK')
      mParams[`verifyResult${outParamNum}`] = JSON.stringify(signInfo)
      outParamNum++
      if (!signInfo.success) {
        throw new Error(signInfo.message)
      }
    })
    for (let i = 0; i < 10; i++) {
      let dat = fixtures[Math.floor(Math.random() * fixtures.length)]
      let signature = iitCrypto.signData(dat)
      let signInfo = iitCrypto.verifyData(signature, dat)
      if (!signInfo.success) {
        throw new Error(signInfo.message)
      }
    }
    // console.log(signInfo);
    let cert = iitCrypto.getOwnCertificate()
    let certInfo = iitCrypto.parseCertificate(cert)
    mParams[`ownCertificate`] = JSON.stringify(certInfo)
    console.log(thCode, 'OK')
    // console.log(certInfo);
    // ctx.mParams.makeLog =
  } catch (err) {
    console.log(thCode, 'failure')
    throw err
  }
}
