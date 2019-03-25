/**
 * @module ubErrors
 * @memberOf module:@unitybase/ub
 */

/**
 * Server-side Abort exception. To be used in server-side logic in case of HANDLED
 * exception. This errors logged using "Error" log level to prevent unnecessary
 * EXC log entries.
 *
 *       // UB client will show message inside <<<>>> to user (and translate it using UB.i18n)
 *       const UB = require('@unitybase/ub')
 *       throw new UB.UBAbort('<<<textToDisplayForClient>>>')
 *       // In case message should not be shown to the end used by ub-pub globalExceptionHandler `<<<>>>` can be omitted
 *       throw new UB.UBAbort('wrongParameters')
 *
 * @param {String} [message] Message
 * @extends {Error}
 * @constructor
 */
function UBAbort (message) {
  // For SM<=45 we use a "exception class" inherit pattern below, but it stop working in SM52, so fallback to Error
  this.name = 'UBAbort'
  this.code = 'UBAbort'
  this.message = message || 'UBAbortError'
  // FF, IE 10+ and Safari 6+. Fallback for others
  let tmpStack = (new Error()).stack.split('\n').slice(1)
  let realErr = tmpStack.find((str) => str.indexOf('@') > 0) // search for a first error outside of ub core modules
  let re = /^(.*?)@(.*?):(.*?)$/.exec(realErr) // [undef, undef, this.fileName, this.lineNumber] = re
  this.fileName = re[2]
  this.lineNumber = re[3]
  this.stack = tmpStack.join('\n')
  // original FF version:
  // this.stack = (new Error()).stack;
}
UBAbort.prototype = Object.create(Error.prototype) // new Error();
UBAbort.prototype.constructor = UBAbort

const E_SECURITY_EX_NUM = process.binding('ub_app')['UBEXC_ESECURITY_EXCEPTION']
/**
 * Server-side Security exception. Throwing of such exception will trigger `Session.securityViolation` event
 * @param {string} reason
 * @constructor
 */
function ESecurityException (reason) {
  this.errorNumber = E_SECURITY_EX_NUM
  this.message = reason || 'ESecurityException'
  // FF, IE 10+ and Safari 6+. Fallback for others
  let tmpStack = (new Error()).stack.split('\n').slice(1)
  let realErr = tmpStack.find((str) => str.indexOf('@') > 0) // search for a first error outside of ub core modules
  let re = /^(.*?)@(.*?):(.*?)$/.exec(realErr) // [undef, undef, this.fileName, this.lineNumber] = re
  this.fileName = re[2]
  this.lineNumber = re[3]
  this.stack = tmpStack.join('\n')
}
ESecurityException.prototype = Object.create(Error.prototype) // new Error();
ESecurityException.prototype.constructor = ESecurityException

module.exports = {
  UBAbort,
  ESecurityException
}
