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
  const { ID, parentID } = ctxt.mParams.execParams
  if (!parentID) return true

  const store = UB.Repository('org_unit').attrs(['ID', 'parentID', 'mi_treePath'])
    .where('[ID]', '=', parentID).select()
  if (store.rowCount > 0 || ((store.get('mi_treePath') || '').indexOf(ID) > 0)) {
    const pList = (store.get('mi_treePath') || '').split('/')
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

  const attrs = Object.keys(execParams)
  const needUpdateStaffUnit = attrs.find(attrName => attrName.startsWith('caption'))
  if (!needUpdateStaffUnit) return

  const updParams = {
    ['caption_' + App.defaultLang + '^']: ''
  }
  const staffUnits = UB.Repository('org_staffunit').attrs('[ID]')
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
