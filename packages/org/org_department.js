const UB = require('@unitybase/ub')
const App = UB.App
/* global org_department ubs_numcounter */
// eslint-disable-next-line camelcase
const me = org_department
// TODO verify updating me.entity.addMethod('afterbeforeupdate')
me.on('update:before', generateDefaultCaption)
me.on('insert:before', generateDefaultCodeAndCaption)

/**
 * Updates all multilingual captions for org_department
 * @method setCaption
 * @memberOf cdn_organization_ns.prototype
 * @memberOfModule @unitybase/org
 * @param {ubMethodParams} ctx
 * @param {string} mode One on 'INS', 'UPD'
 */
me.setCaption = function (ctx, mode) {
  const execParams = ctx.mParams.execParams
  const defaultSuffix = `_${App.defaultLang}^`
  const supportedLangs = me.entity.connectionConfig.supportLang

  if (mode === 'INS') {
    supportedLangs.forEach(function (lang) {
      let suffix = '_' + lang + '^'
      if (execParams['name' + suffix]) {
        execParams['caption' + suffix] = execParams.code + ' - ' + execParams['name' + suffix]
      } else {
        execParams['caption' + suffix] = execParams.code + ' - ' + execParams['name']
      }
    })
  } else if (mode === 'UPD') {
    let fieldList = ['code']
    supportedLangs.forEach(function (lang) {
      fieldList.push('name' + '_' + lang + '^')
    })
    if (execParams.name) { // Here is the standard values for all "name" attributes ( "name_uk^" instead of "name", etc)
      execParams['name' + defaultSuffix] = execParams.name
      delete execParams.name
    }
    let department = UB.Repository('org_department')
      .attrs(fieldList)
      .where('ID', '=', execParams.ID)
      .misc({__allowSelectSafeDeleted: true})
      .misc({__mip_recordhistory_all: true})
      .selectSingle()
    supportedLangs.forEach(function (lang) {
      let suffix = '_' + lang + '^'
      let name = execParams['name' + suffix] || department['name' + suffix]
      let code = execParams.code || department.code
      execParams['caption' + suffix] = code + ' - ' + name
    })
  }
  delete execParams.caption
  return true
}

/**
 * @private
 * @param {ubMethodParams} ctxt
 * @returns {boolean}
 */
function generateDefaultCaption (ctxt) {
  return me.setCaption(ctxt, 'UPD')
}

/**
 * @private
 * @param {ubMethodParams} ctxt
 * @returns {boolean}
 */
function generateDefaultCodeAndCaption (ctxt) {
  ubs_numcounter.generateAutoIncrementalCode(ctxt, 'code')
  return me.setCaption(ctxt, 'INS')
}
