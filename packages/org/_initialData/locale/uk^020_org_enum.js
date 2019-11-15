const loader = require('@unitybase/base').dataLoader
/**
 * @author pavel.mash
 * Enumeration localization to Ukrainian for ORG model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let localizationConfig = {
    entity: 'ubm_enum',
    keyAttribute: 'code',
    localization: [
      // CDN_EMPLOYEEONSTAFFTYPE
      { keyValue: 'PERMANENT', execParams: { name: 'Постійний' } },
      { keyValue: 'TEMPORARY', execParams: { name: 'т.в.о.' } },
      { keyValue: 'ASSISTANT', execParams: { name: 'Асистент' } },
      // ORG_UNITTYPE
      { keyValue: 'STAFF', execParams: { name: 'Персонал' } },
      { keyValue: 'ORG', execParams: { name: 'Організація' } },
      { keyValue: 'DEP', execParams: { name: 'Підрозділ' } }
    ]
  }
  loader.localizeEntity(session, localizationConfig, __filename)
}
