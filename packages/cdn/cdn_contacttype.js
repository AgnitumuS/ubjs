const UB = require('@unitybase/ub')
const App = UB.App
// @author pavel.mash on 28.10.2014.
/* global cdn_contacttype */
// eslint-disable-next-line camelcase
const me = cdn_contacttype
const ENTITY_NAME = me.entity.name
const CACHE_KEY = ENTITY_NAME + '_CACHE'

me.on('update:after', clearCache)
me.on('insert:after', clearCache)
me.on('delete:after', clearCache)

/**
 * Search for contact type ID by code. Use cache for quick lookup. Return 0 in case no such contact type.
 * @method getContactTypeByCode
 * @memberOf cdn_contacttype_ns.prototype
 * @memberOfModule @unitybase/cdn
 * @param {string} contactCode
 * @returns {number}
 */
function getContactTypeByCode (contactCode) {
  let entry = App.globalCacheGet(CACHE_KEY)
  let cachedTypes = entry ? JSON.parse(entry) : {}

  if (!cachedTypes.hasOwnProperty(contactCode)) {
    let ID = UB.Repository(ENTITY_NAME).attrs('ID').where('code', '=', contactCode).selectScalar()
    cachedTypes[contactCode] = ID || 0
    App.globalCachePut(CACHE_KEY, JSON.stringify(cachedTypes))
  }
  return cachedTypes[contactCode]
}
me.getContactTypeByCode = getContactTypeByCode

/**
 * Cleat cache after insert/update/delete
 * @private
 */
function clearCache () {
  App.globalCachePut(CACHE_KEY, '')
}
