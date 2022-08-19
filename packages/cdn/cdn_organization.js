const UB = require('@unitybase/ub')
const Session = UB.Session
/* global cdn_organization ubs_settings ubs_numcounter */
// eslint-disable-next-line camelcase
const me = cdn_organization
const _ = require('lodash')

me.on('update:before', doBeforeUpdate)
me.on('insert:before', doBeforeInsert)

/**
 * Updates all multilingual captions for cdn_organization
 * @method updateOrganizationCaption
 * @memberOf cdn_organization_ns.prototype
 * @memberOfModule @unitybase/cdn
 * @param {ubMethodParams} ctx
 */
me.updateOrganizationCaption = function (ctx) {
  const execParams = ctx.mParams.execParams
  const organizationID = execParams.ID
  const supportedLangs = me.entity.connectionConfig.supportLang

  const defaultSuffix = `_${Session.userLang}^`
  const inserting = (ctx.mParams.method === 'insert')
  if (execParams.name) { // Here is the standard values for all "name" attributes ( "name_uk^" instead of "name", etc)
    execParams['name' + defaultSuffix] = execParams.name
    delete execParams.name
  }
  const orgFields = ['corrIndexID']
  supportedLangs.forEach(function (lang) {
    const suffix = `_${lang}^`
    orgFields.push('name' + suffix)
    if (!execParams['name' + suffix] && inserting) {
      execParams['name' + suffix] = execParams['name' + defaultSuffix]
    }
  })

  const dataStore = UB.Repository(me.entity.name)
    .attrs(orgFields)
    .where('[ID]', '=', organizationID)
    .select()
  const corrIndexID = execParams.corrIndexID ? execParams.corrIndexID : dataStore.get('corrIndexID')

  let corrIndexCode = ''
  if (corrIndexID) {
    corrIndexCode = UB.Repository('cdn_corrindex')
      .attrs(['code', 'ID'])
      .where('[ID]', '=', corrIndexID)
      .selectScalar()
  }
  corrIndexCode = corrIndexCode ? corrIndexCode + ' ' : ''

  supportedLangs.forEach(function (lang) {
    const suffix = '_' + lang + '^'
    const orgName = execParams['name' + suffix] || dataStore.get('name' + suffix)

    execParams['caption' + suffix] = corrIndexCode + orgName
  })
  delete execParams.caption
}

/**
 * Split string using separator and trim each result word
 * @private
 * @param {String} string2Split
 * @param {String} separator
 * @returns {Array}
 */
function splitStringWithTrim (string2Split, separator) {
  const array = string2Split.split(separator)
  for (let i = 0, L = array.length; i < L; ++i) {
    array[i] = array[i].trim()
  }
  return array
}

let allowAutoGenerateOKPO = null

/**
 * @private
 * @param {ubMethodParams} ctx
 * @returns {boolean}
 */
function checkCode (ctx) {
  const mParams = ctx.mParams
  const execParams = mParams.execParams

  if (!execParams.OKPOCode) {
    const isOKPORequired = ubs_settings.loadKey('org.organization.OKPORequired', false)
    if (isOKPORequired === false) {
      return true
    }
    if (allowAutoGenerateOKPO === null) allowAutoGenerateOKPO = ubs_settings.loadKey('cdn.organization.allowAutoGenerateOKPO', false)
    if (allowAutoGenerateOKPO) {
      execParams.OKPOCode = 'A' + ubs_numcounter.getRegnum(mParams.entity, 1000000)
    } else {
      throw new UB.UBAbort(UB.i18n('errNotExsistsOKPO'))
    }
  } else {
    execParams.OKPOCode = execParams.OKPOCode.trim()
  }

  // if (execParams.OKPOCode.length !== 8 && execParams.OKPOCode.length !== 10) {
  //   throw new UB.UBAbort(UB.i18n('errMustContainsOnly8Or10Symbols'))
  // }
}

/**
 * @private
 * @param {ubMethodParams} ctxt
 * @param {boolean} isUpdate
 * @returns {boolean}
 */
function checkAccessAddGovByRoles (ctxt, isUpdate) {
  let newBusinessTypeID = ctxt.mParams.execParams.orgBusinessTypeID || 0
  if (!newBusinessTypeID && !isUpdate) return true // insertion without orgBusinessTypeID
  let oldBusinessTypeID = 0
  if (isUpdate) {
    let dn = ctxt.dataStore.currentDataName
    ctxt.dataStore.currentDataName = TubDataStore.DATA_NAMES.BEFORE_UPDATE
    oldBusinessTypeID = ctxt.dataStore.get('orgBusinessTypeID') || 0
    ctxt.dataStore.currentDataName = dn
    if (!oldBusinessTypeID && !newBusinessTypeID) return true // no business type
  }
  const isGovAuthority = UB.Repository('cdn_orgbusinesstype')
    .attrs('isGovAuthority')
    .where('isGovAuthority', '=', true)
    .where('[ID]', 'in', [newBusinessTypeID, oldBusinessTypeID])
    .limit(1)
    .selectScalar()
  if (!isGovAuthority) return true // if no row exists - this is not a gov authority
  const accessAddGovByRoles = ubs_settings.loadKey('cdn.organization.accessAddGovByRoles', '')
  if (accessAddGovByRoles === '') { // if setting is not present or it is empty
    return true
  }
  let rolesIntersection
  try {
    const accessRoles = splitStringWithTrim(accessAddGovByRoles, ',')
    const currentUserRoles = splitStringWithTrim(Session.uData.roles, ',')
    rolesIntersection = _.intersection(accessRoles, currentUserRoles)
  } catch (o) {
    throw new UB.UBAbort(UB.i18n('errUnableToPerformThisOperation'))
  }

  if (rolesIntersection.length > 0) return true

  throw new UB.UBAbort(UB.i18n('errNoRightsForInsUpdateGovOrg'))
}

/**
 * @private
 * @param {ubMethodParams} ctxt
 * @returns {boolean}
 */
function doBeforeInsert (ctxt) {
  if (ctxt.mParams.execParams.orgBusinessTypeID) {
    checkAccessAddGovByRoles(ctxt)
  }
  checkCode(ctxt)
  me.updateOrganizationCaption(ctxt)
  return true
}

/**
 * @private
 * @param {ubMethodParams} ctxt
 * @returns {boolean}
 */
function doBeforeUpdate (ctxt) {
  const execParams = ctxt.mParams.execParams
  if (typeof execParams.OKPOCode !== 'undefined') {
    checkCode(ctxt)
  }
  checkAccessAddGovByRoles(ctxt, true)
  me.updateOrganizationCaption(ctxt)
  return true
}
