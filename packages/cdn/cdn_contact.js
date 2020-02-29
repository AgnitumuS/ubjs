const UB = require('@unitybase/ub')
// @author pavel.mash on 28.10.2014
/* global cdn_contact cdn_contacttype */
// eslint-disable-next-line camelcase
const me = cdn_contact

me.on('insert:after', afterInsertContact)
me.on('update:after', afterUpdateContact)

/**
 * @private
 * @param {ubMethodParams} ctx
 */
function afterInsertContact (ctx) {
  const { contactTypeID, subjectID, value } = ctx.mParams.execParams
  updateUserMail(contactTypeID, subjectID, value)
}

/**
 * @private
 * @param {ubMethodParams} ctx
 */
function afterUpdateContact (ctx) {
  let { contactTypeID, subjectID, value } = ctx.mParams.execParams
  if (value === undefined) {
    // Value is not updated
    return
  }

  // If any of "contactTypeID" or "subjectID" attributes not provided in execParams, get previous values from
  // "selectBeforeUpdate" dataset
  const oldCurrentDataName = ctx.dataStore.currentDataName
  ctx.dataStore.currentDataName = 'selectBeforeUpdate'
  try {
    if (contactTypeID === undefined) contactTypeID = ctx.dataStore.get('contactTypeID')
    if (subjectID === undefined) subjectID = ctx.dataStore.get('subjectID')
  } finally {
    ctx.dataStore.currentDataName = oldCurrentDataName
  }

  updateUserMail(contactTypeID, subjectID, value)
}

/**
 * Update uba_user.email for all employee contact
 * @private
 * @param {Number} contactTypeID
 * @param {Number} subjectID
 * @param {String} value
 */
function updateUserMail (contactTypeID, subjectID, value) {
  const contactType = UB.Repository('cdn_contacttype')
    .attrs('code')
    .selectById(contactTypeID)
  if (contactType.code !== 'email') return

  const empUserID = UB.Repository('org_employee')
    .attrs('userID')
    .where('ID', '=', subjectID)
    .selectScalar()
  if (!empUserID) return

  const userStore = UB.DataStore('uba_user')
  userStore.run('update', {
    execParams: {
      ID: empUserID,
      email: value
    },
    __skipOptimisticLock: true
  })
}

/**
 * Search for subjects contact values.
 * @method getSubjectsContacts
 * @memberOf cdn_contact_ns.prototype
 * @memberOfModule @unitybase/cdn
 * @param {Number|Array.<number>} subjects Either subject ID or array of subject IDs to search
 * @param {String} contactCode Contact type code ('phone', 'email', e.t.c - one of cdn_contacttype.code value
 * @returns {Array.<string>}
 */
function getSubjectsContacts (subjects, contactCode) {
  const result = []
  const typeID = cdn_contacttype.getContactTypeByCode(contactCode)
  if (!typeID || (Array.isArray(subjects) && !subjects.length) || !subjects) return result
  const repo = UB.Repository(me.entity.name).attrs('value').where('contactTypeID', '=', typeID)
  if (Array.isArray(subjects)) {
    repo.where('subjectID', 'in', subjects)
  } else {
    repo.where('subjectID', '=', subjects)
  }
  const store = repo.selectAsArray()
  return store.resultData.data.reduce((a, b) => [...a, ...b], []) // _.flatten(store.resultData.data);
}

me.getSubjectsContacts = getSubjectsContacts
