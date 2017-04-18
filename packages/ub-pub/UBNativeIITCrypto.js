  /*
 @author v.orel
 */
const ubUtils = require('./utils')
const UBNativeMessage = require('./UBNativeMessage')

/**
 * @class UBNativeIITCrypto
 * Ukrainian IIT cryptographic service. Require native messages feature 'iit' to be installed.
 *
 * In Ext-based application instance of  UBNativeIITCrypto accessible via $App.connection.pki()
 * Usage sample:
 *
      var file = fileInputEl.dom.files[0];
      $App.connection.pki().then(function (pki) {
          return pki.readPK().then(function () {
              return {pki: pki, b64File: UB.base64fromAny(file)}
          }).then(function (params) {
              return params.pki.signData(params.b64File)
          }).then(function (signature) {
              console.log('Base64 p7s file representation:', signature)
          })
      })

 * @constructor
 * Construct new Cryptography service
 * @param {Object} [config] initial parameters
 * @param {Number} [config.waitTimeout=180000] Default timeout for cryptographic operation (in ms)
 */
function UBNativeIITCrypto (config) {
  let crypto = Object.create(UBNativeIITCrypto.prototype)
  let initialized = false

  let nm = new UBNativeMessage('iit')
    /**
     * Native messages nm instance
     * @property {UBNativeMessage} nm
     * @protected
     */
  crypto.nm = nm
  crypto.nm.callTimeOut = (config && config.waitTimeout) || 180000

    /**
     * Initialize encryption
     * @return {Promise<UBNativeIITCrypto>} resolved to self
     */
  crypto.init = function () {
    if (initialized) {
      return Promise.resolve(crypto)
    } else {
      return nm.connect().then(function (nm) {
        return nm.invoke('init', null).then(function () {
          initialized = true
          return crypto
        })
      })
    }
  }

  /**
   * for IIT try load pk on error select cert and set it in store
   * @param {UBConnection} connection
   * @returns {Promise}
   */
  crypto.readPK = function (connection) {
    let me = this

    let promise = me.nm.invoke('getPrivateKeyReaded').then(function (keyIsReaded) {
      if (keyIsReaded) {
        return true
      } else {
        return me.nm.invoke('CheckSettings').then(function (settingsOk) {
          if (settingsOk) {
            return me.nm.invoke('readPK', [], 300000).then(function (pkResult) {
              switch (parseInt(pkResult.result, 10)) {
                case 0: // everything is OK
                  return pkResult.result
                case 12: // read of private key is canceled by user
                  throw new ubUtils.UBAbortError('readPKCanceled')
                case 51: // certificate not found - either user certificate not in certificate store, or root certificates not loaded to certificate store
                  return me.nm.invoke('loadCertDialog', [], 300000).then(function () {
                      // download root certs
                    return connection.get('downloads/cert/CertList.json')
                  })
                    .then(loadCerts)
                    .then(function () {
                      return me.nm.invoke('readPK', [], 300000).then(function (pkResult) {
                        if (parseInt(pkResult.result, 10) === 51) {
                          throw new ubUtils.UBError('invalidPrivateKeyCertificate', pkResult.lastError)
                        } else {
                          return pkResult.result
                        }
                      })
                    })
                default: // unknown result
                  if (pkResult.lastError) {
                    throw new ubUtils.UBError(pkResult.lastError, pkResult.result)
                  } else {
                    throw new Error(pkResult.result)
                  }
              }
            })
          } else {
            return Promise.reject({errMsg: 'nm.CheckSettings() fail'})
          }
        })
      }
    })

    // here private key is loaded
    return promise.then(function () {
      let certificateInfo = {}

      return me.nm.invoke('getOwnCert').then(function (ownIITCer) {
        certificateInfo.ownIITCert = ownIITCer
        if (!certificateInfo.ownIITCert || (certificateInfo.ownIITCert === '')) {
          throw new Error('getOwnCertFail')
        }
        return me.nm.invoke('getOwnCertEncrypt').then(function (ownIITEncryptCert) {
          certificateInfo.ownIITEncryptCert = ownIITEncryptCert
          return me.nm.invoke('getOwnCertEncryptSignature').then(function (ownIITEncryptSignature) {
            certificateInfo.ownIITEncryptSignature = ownIITEncryptSignature
            return certificateInfo
          })
        })
      })
    }, function (rejection) {
      me.nm.invoke('closePK')
      throw rejection
    })

    function loadCerts (certListResult) {
      let certificates = certListResult.data
      let reqArr = []
      certificates.forEach(function (certName) {
        let req = connection.get('downloads/cert/' + certName, {
          responseType: 'arraybuffer'
        }).then(function (cert) {
          return ubUtils.base64FromAny(cert.data)
        }).then(function (base64Data) {
          return me.nm.invoke('AddCert', base64Data)
        })
        reqArr.push(req)
      })
      return Promise.all(reqArr)
    }
  }

  /**
   * Set server side certificate
   * @deprecated Due to wrong name this function is deprecated since UB 4.0. Use setRecipientCertificate instead.
   * @param {String} base64encodedCert
   */
  crypto.setServerCertificate = function (base64encodedCert) {
    return this.nm.invoke('setServerCert', base64encodedCert)
  }

  /**
   * Set recipient certificate for use in encryption operations
   * @param {String} base64encodedCert
   */
  crypto.setRecipientCertificate = function (base64encodedCert) {
    return this.nm.invoke('setServerCert', base64encodedCert)
  }

  /**
   * Decrypt envelope to string using client private key.
   * {@link UBNativeIITCrypto#readPK} must be called before
   * @param {String} envelope base64 encoded envelope
   * @param {Boolean} resultAsBase64
   * @method
   * @returns {Promise}
   */
  crypto.decryptEnvelope = function (envelope, resultAsBase64) {
    return this.nm.invoke('decryptEnvelope', {data: envelope, toBase64: resultAsBase64})
  }

  /**
   * Encrypt string to envelope using the public key, previously loaded by {@link UBNativeIITCrypto#setRecipientCertificate}
   * @param {String} base64string
   * @param {Boolean} resultAsBase64
   * @method
   * @returns {Promise}
   */
  crypto.encryptEnvelope = function (base64string, resultAsBase64) {
    return this.nm.invoke('encryptEnvelope', {data: base64string, isBase64: resultAsBase64})
  }

  /**
   * Close previously opened private key.
   * @returns {Promise}
   */
  crypto.closePK = function () {
    return this.nm.invoke('closePK')
  }

  /**
   * Sign data and return base 64 encoded signature of it. Data can be either base64 encoded binary data or string
   * @param {String} data
   * @param {Boolean} [dataIsBase64=true]
   * @returns {Promise} Resolved to base64 encoded <a href="http://habrahabr.ru/post/256367/">p7s</a> data signature
   */
  crypto.signData = function (data, dataIsBase64) {
    return this.nm.invoke('IITSignData', {data: data, isBase64: typeof dataIsBase64 === 'undefined' ? true : dataIsBase64})
  }

  /**
   * Verify data signature. If successfully - return promise, resolved to signature info, else - reject with reason
   * @param {String} data
   * @param {String} signature Base64 encoded data signature
   * @param {Boolean} [dataIsBase64=true]
   * @returns {Promise}
   */
  crypto.verifySignature = function (data, signature, dataIsBase64) {
    return this.nm.invoke('IITVerifyData', {data: data, signature: signature, isBase64: typeof dataIsBase64 === 'undefined' ? true : dataIsBase64})
  }

  function toJSON (val) {
    return val ? JSON.parse(val) : val
  }

  /**
   * Parse certificate and return promise, resolved to certificate detail information JSON
   * @param {String} certificate Base64 encoded data
   * @returns {Promise}
   */
  crypto.parseCertificate = function (certificate) {
    return this.nm.invoke('parseCertificate', {certificate: certificate}).then(toJSON)
  }

  /**
   * Return promise, resolved to owner certificate detail information JSON. In case of several own certificates - return certificate for signing
   * @returns {Promise}
   */
  crypto.getOwnCertificateInfo = function () {
    return this.nm.invoke('getOwnCertificateInfo', {}).then(toJSON)
  }

  /**
   * Parse signature and return promise, resolved to signer certificate detail information JSON
   * @param {Number} signIndex number of signature start from 0
   * @param {String} signature Base64 encoded data
   * @returns {Promise}
   */
  crypto.getSignerInfo = function (signIndex, signature) {
    return this.nm.invoke('getSignerInfo', { signIndex: signIndex, signature: signature }).then(toJSON)
  }

  /**
   * Get name of key media from where private key is loaded. Return '' on errors or if key not loaded yet
   * @return {Promise<string>}
   */
  crypto.keyMediaName = function () {
    return this.nm.invoke('keyMediaName', {})
  }

  /**
   * Get device fingerprint
   * @return {Promise<string>}
   */
  crypto.fp = function () {
    return this.nm.invoke('fp', {})
  }

  return crypto
}

module.exports = UBNativeIITCrypto

