const loader = require('@unitybase/base').dataLoader
/**
 * @author pavel.mash
 * Enumeration localization to Russian for ORG model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let localizationConfig = {
    entity: 'ubm_enum',
    keyAttribute: 'code',
    localization: [
      // CDN_EMPLOYEEONSTAFFTYPE
      { keyValue: 'PERMANENT', execParams: { name: 'Постоянный' } },
      { keyValue: 'TEMPORARY', execParams: { name: 'вр.и.о.' } },
      { keyValue: 'ASSISTANT', execParams: { name: 'Ассистент' } },
      // ORG_UNITTYPE
      { keyValue: 'STAFF', execParams: { name: 'Персонал' } },
      { keyValue: 'ORG', execParams: { name: 'Организация' } },
      { keyValue: 'DEP', execParams: { name: 'Подразделение' } },
      { keyValue: 'EXECGROUP', execParams: { name: 'Группа исполнителей' } }
    ]
  }
  loader.localizeEntity(session, localizationConfig, __filename)
}
