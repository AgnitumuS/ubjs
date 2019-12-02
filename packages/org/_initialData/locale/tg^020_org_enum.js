const loader = require('@unitybase/base').dataLoader
/**
 * @author pavel.mash
 * Enumeration localization to Tajik for ORG model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let localizationConfig = {
    entity: 'ubm_enum',
    keyAttribute: 'code',
    localization: [
      // CDN_EMPLOYEEONSTAFFTYPE
      { keyValue: 'PERMANENT', execParams: { name: 'Доимӣ' } },
      { keyValue: 'TEMPORARY', execParams: { name: 'м. и. в.' } },
      { keyValue: 'ASSISTANT', execParams: { name: 'Ёрдамчи' } },
      // ORG_UNITTYPE
      { keyValue: 'STAFF', execParams: { name: 'Кормандон' } },
      { keyValue: 'ORG', execParams: { name: 'Ташкилот' } },
      { keyValue: 'DEP', execParams: { name: 'Шӯъба' } },
      { keyValue: 'EXECGROUP', execParams: { name: 'Гурӯҳҳои рассомон' } }
    ]
  }
  loader.localizeEntity(session, localizationConfig, __filename)
}
