const UB = require('@unitybase/ub')
const App = UB.App
/* global ubs_numcounter ubs_numcounterreserv ubs_settings */
// eslint-disable-next-line camelcase
const me = ubs_numcounter
me.entity.addMethod('getRegnumCounter')

/**
 * Return counter number by mask
 * @method getRegnum
 * @memberOf ubs_numcounter_ns.prototype
 * @memberOfModule @unitybase/ubs
 * @param {String} regKeyValue Registration key mask
 * @param {Number} [startNum] The starting counter value in case mask not exists
 * @param {Boolean} [skipReservedNumber=false] When "true" skip loading number from reserve and calculate new number by mask
 * @return {Number} Next number for this mask
 */
me.getRegnum = function (regKeyValue, startNum, skipReservedNumber) {
  let res
  let counterInData = -1

  if (startNum !== 0) startNum = startNum || 1
  // Get autoRegWithDeletedNumber from settings if skipReservedNumber is not true
  let autoRegWithDeletedNumber = !skipReservedNumber ? ubs_settings.loadKey('ubs.numcounter.autoRegWithDeletedNumber', true) : false
  // Get counter from reserved if autoRegWithDeletedNumber set to true in settings
  let reservedCounter = (autoRegWithDeletedNumber === true) ? ubs_numcounterreserv.getReservedRegnum(regKeyValue) : -1

  if (reservedCounter !== -1) {
    counterInData = reservedCounter
  } else {
    // check number mask exist in ubs_numcounter
    let store = UB.Repository('ubs_numcounter')
      .attrs(['ID'])
      .where('[regKey]', '=', regKeyValue)
      .select()

    // if mask not exists - add it
    if (store.eof) {
      counterInData = startNum
      res = store.run('insert', {
        execParams: {
          regKey: regKeyValue,
          counter: startNum
        }
      })
      if (!res) throw store.lastError
    } else {
      // in case mask exist
      let IDInData = store.get('ID')
      // lock it for update
      store.run('update', {
        execParams: {
          ID: IDInData,
          regKey: regKeyValue
        }
      })
      // retrieve current number
      store = UB.Repository('ubs_numcounter')
        .attrs(['ID', 'regKey', 'counter'])
        .where('ID', '=', IDInData)
        .select()
      // increment it
      counterInData = store.get('counter') + 1
      // and update a incremented counter value
      res = store.run('update', {
        execParams: {
          ID: IDInData,
          regKey: regKeyValue,
          counter: counterInData
        }
      })
      if (!res) throw store.lastError
    }
  }
  return counterInData
}

/**
 * Generate auto incremental code for specified entity attribute in case
 * attribute value in execParams is empty or equal to attribute default value,
 * specified in meta file.
 *
 * Will create a numcounter with code === entity.name and 1 as initial value.
 *
 * Result value will be left padded by '0' to the length specified in ubs_settings
 * To be used in `insert:before` handler as
 * @example

const me = cdn_profession
me.on('insert:before', generateAutoIncrementalCode)

function generateAutoIncrementalCode (ctx) {
  ubs_numcounter.generateAutoIncrementalCode(ctx, 'code')
}

 * @method generateAutoIncrementalCode
 * @memberOf ubs_numcounter_ns.prototype
 * @memberOfModule @unitybase/ubs
 * @param {ubMethodParams} ctx
 * @param {string} ctx.mParams.entity
 * @param {TubList|Object} ctx.mParams.execParams
 * @param {string} [forAttribute='code'] Code of attribute for number generation
 */
me.generateAutoIncrementalCode = function (ctx, forAttribute = 'code') {
  const mParams = ctx.mParams
  const execParams = mParams.execParams
  if (!execParams) return
  const entityCode = mParams.entity
  const ubEntity = App.domainInfo.get(entityCode)
  const attr = ubEntity.attributes[forAttribute]
  let newAttrValue = execParams[forAttribute]
  if (execParams && (!newAttrValue || (attr.defaultValue && attr.defaultValue === execParams[forAttribute]))) {
    const padTo = ubs_settings.loadKey('ubs.numcounter.autoIncrementalCodeLen', 12)
    let newNum = '' + ubs_numcounter.getRegnum(entityCode, 1)
    execParams.code = newNum.padStart(padTo, '0')
  }
}
/**
 * Get counter value by registration key
 * @method getRegnumCounter
 * @memberOf ubs_numcounter_ns.prototype
 * @memberOfModule @unitybase/ubs
 * @published
 * @param {ubMethodParams} ctxt
 * @param {string} ctxt.mParams.execParams.regkey
 * @param {boolean} ctxt.mParams.execParams.skipReservedNumber Skip loading number from reserve and calculate new number by mask
 */
me.getRegnumCounter = function (ctxt) {
  // RegKey caller pass to method
  let upregKey = ctxt.mParams.execParams.regkey
  let skipReservedNumber = ctxt.mParams.execParams.skipReservedNumber || false
  ctxt.mParams.getRegnumCounter = me.getRegnum(upregKey, 1, skipReservedNumber)
  return true
}
