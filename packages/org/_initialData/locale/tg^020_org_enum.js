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
      { keyValue: 'PERMANENT', execParams: { name: 'Доимӣ' } },
      { keyValue: 'TEMPORARY', execParams: { name: 'м. и. в.' } },
      { keyValue: 'ASSISTANT', execParams: { name: 'Ёрдамчи' } }
    ]
  }
  loader.localizeEntity(session, localizationConfig, __filename)
}
