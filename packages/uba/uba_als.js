const UB = require('@unitybase/ub')
/* global uba_als */
// eslint-disable-next-line camelcase
let me = uba_als
me.entity.addMethod('save')

/**
 * Save one ALS row. If case unique row "entity+attribute+state+roleName" is found in the database then
 * row will be update, else will be inserted
 *
 * @method save
 * @param {ubMethodParams} ctxt
 * @return {boolean}
 * @memberOf uba_als_ns.prototype
 * @memberOfModule @unitybase/uba
 * @published
 */
me.save = function (ctxt) {
  let execParams = ctxt.mParams.execParams

  let alsDataStore = UB.Repository('uba_als')
    .attrs(['ID'])
    .where('[entity]', '=', execParams.entity)
    .where('[attribute]', '=', execParams.attribute)
    .where('[state]', '=', execParams.state)
    .where('[roleName]', '=', execParams.roleName)
    .select()

  let rowCount = alsDataStore.rowCount
  let execInst = UB.DataStore('uba_als')

  console.debug('rowCount:', rowCount)

  if (rowCount === 0) {
    // insert
    console.debug('executing INSERT')
    let insertExecParams = {
      entity: execParams.entity,
      attribute: execParams.attribute,
      state: execParams.state,
      roleName: execParams.roleName,
      actions: execParams.actions
    }

    execInst.run('insert', {
      execParams: insertExecParams
    })
  } else {
    // update
    console.debug('executing UPDATE')
    let updateExecParams = {
      ID: alsDataStore.get('ID'),
      actions: execParams.actions
    }

    execInst.run('update', {
      execParams: updateExecParams
    })
  }
  return true
}
