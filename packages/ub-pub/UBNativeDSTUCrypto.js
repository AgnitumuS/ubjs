/*
 @author pavel.mash
 */
var ubUtils = require('./utils')
var UBNativeMessage = require('./UBNativeMessage')

/**
 * @class UBNativeDSTUCrypto
 * Ukrainian DSTU cryptographic service. Require native messages feature 'dstu' to be installed.
 * @constructor
 * Construct new Cryptography service
 * @param {Object} config initial parameters
 * @param {Number} [config.waitTimeout=180000] Default timeout for cryptographic operation (in ms)
 */
function UBNativeDSTUCrypto (config) {
  var
    crypto = Object.create(UBNativeDSTUCrypto.prototype),
    nm,
    initialized = false

  nm = new UBNativeMessage('dstu')
    /**
     * Native messages plugin instance
     * @property {UBNativeMessage} plugin
     * @protected
     */
  crypto.nm = nm
  crypto.nm.callTimeOut = (config && config.waitTimeout) || 180000

    /**
     * Initialize encryption
     * @param {String} serverCertificate base64 encoded server side certificate
     * @return {Promise<UBNativeDSTUCrypto>} resolved to self
     */
  crypto.init = function (serverCertificate) {
    if (initialized) {
      return Promise.resolve(crypto)
    } else {
      return nm.connect().then(function (nm) {
        return nm.invoke('init', serverCertificate).then(function () {
          initialized = true
          return crypto
        })
      })
    }
  }

    /**
     * Encrypt data and return result as array buffer
     * @method
     * @param {String} data
     * @param {Boolean} isBase64
     * @param {Boolean} [compress=false] (Optional)
     * @returns {Promise} ArrayBuffer
     */
  crypto.encryptToArray = function (data, isBase64, compress) {
    return nm.invoke('encrypt', {data: data, isBase64: isBase64, compress: compress || false}).then(function (base64encrypted) {
      return ubUtils.base64toArrayBuffer(base64encrypted)
    })
  }

    /**
     * Decrypt array buffer data
     * @method
     * @param {ArrayBuffer} data
     * @param {Boolean} toBase64
     * @param {Boolean} [isCompressed=false] (optional)
     * @returns {Promise} as Base64
     */
  crypto.decryptArr = function (data, toBase64, isCompressed) {
    if (!data) {
      throw new Error('Do not call decryptArr method with empty value')
    }
    return ubUtils.base64FromAny(data).then(function (b64) {
      return nm.invoke('decrypt', {data: b64, toBase64: toBase64, isCompressed: isCompressed || false})
    })
  }

    /**
     * Creating an envelope with an encryption key.
     * @returns {Promise} resolver to encryption key envelope
     */
  crypto.getEnvelopeWithKey = function () {
    return nm.invoke('getEnvelopeWithKey')
  }

  return crypto
}

module.exports = UBNativeDSTUCrypto
