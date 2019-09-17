const loader = require('@unitybase/base').dataLoader
/**
 * @author pavel.mash
 * Enumeration localization to Tajik for CDN model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let localizationConfig = {
    entity: 'ubm_enum',
    keyAttribute: 'code',
    localization: [
      // CDN_ACCOUNTTYPE
      { keyValue: 'CHECK', execParams: { name: 'Расчетный' } },
      { keyValue: 'CURR', execParams: { name: 'Ҷорӣ' } },
      { keyValue: 'BUDGET', execParams: { name: 'Буҷети' } },
      { keyValue: 'SAVE', execParams: { name: 'Амонати' } },
      { keyValue: 'CORR', execParams: { name: 'Корреспондентский' } },
      // CDN_ADMINUNITTYPE
      { keyValue: 'COUNTRY', execParams: { name: 'Кишвар' } },
      { keyValue: 'DISTRICT', execParams: { name: 'Регион' } },
      { keyValue: 'CITY', execParams: { name: 'Шаҳр' } },
      { keyValue: 'F', execParams: { name: 'З' } },
      { keyValue: 'M', execParams: { name: 'М' } }
    ]
  }
  loader.localizeEntity(session, localizationConfig, __filename)
}
