const UB = require('@unitybase/ub')
// @author pavel.mash on 28.10.2014
/* global cdn_contact cdn_contacttype */
// eslint-disable-next-line camelcase
const me = cdn_contact

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
  let result = []
  let typeID = cdn_contacttype.getContactTypeByCode(contactCode)
  if (!typeID || (Array.isArray(subjects) && !subjects.length) || !subjects) return result
  let repo = UB.Repository(me.entity.name).attrs('value').where('contactTypeID', '=', typeID)
  if (Array.isArray(subjects)) {
    repo.where('subjectID', 'in', subjects)
  } else {
    repo.where('subjectID', '=', subjects)
  }
  let store = repo.selectAsArray()
  return store.resultData.data.reduce((a, b) => [...a, ...b], []) // _.flatten(store.resultData.data);
}

me.getSubjectsContacts = getSubjectsContacts
