const UB = require('@unitybase/ub')
const App = UB.App
/* global org_unit */
// eslint-disable-next-line camelcase
const me = org_unit
me.on('update:before', checkTreeIsNotSelfCircled)
me.on('update:after', updateStaffUnitCaption)
me.on('insert:before', checkTreeIsNotSelfCircled)

/**
 * @private
 * @param {ubMethodParams} ctxt
 */
function checkTreeIsNotSelfCircled (ctxt) {
  let {ID, parentID} = ctxt.mParams.execParams
  if (!parentID) return true

  let store = UB.Repository('org_unit').attrs(['ID', 'parentID', 'mi_treePath'])
    .where('[parentID]', '=', parentID).select()
  if (store.rowCount > 0 || ((store.get('mi_treePath') || '').indexOf(ID) > 0)) {
    let pList = (store.get('mi_treePath') || '').split('/')
    if (pList.indexOf(ID.toString()) >= 0) {
      throw new UB.UBAbort('<<<orgTreeCanNotBeCyclical>>>')
    }
  }
}

const STAFFUNIT_STORE = UB.DataStore('org_staffunit')
/**
 * @private
 * @param {ubMethodParams} ctxt
 */
function updateStaffUnitCaption (ctxt) {
  const execParams = ctxt.mParams.execParams

  let attrs = Object.keys(execParams)
  let needUpdateStaffUnit = false
  attrs.forEach(execParams, function (value, attr) {
    if (attr.indexOf('caption') === 0) {
      needUpdateStaffUnit = true
    }
  })
  if (!needUpdateStaffUnit) return

  let updParams = {
    ['caption_' + App.defaultLang + '^']: ''
  }
  let staffUnits = UB.Repository('org_staffunit').attrs('[ID]')
    .where('parentID', '=', execParams.ID).select()
  while (!staffUnits.eof) {
    updParams.ID = staffUnits.get(0)
    STAFFUNIT_STORE.run('update', {
      caller: me.entity.name,
      execParams: updParams,
      __skipOptimisticLock: true
    })
    staffUnits.next()
  }
}
