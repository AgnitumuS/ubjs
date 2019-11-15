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
      { keyValue: 'CHECK', execParams: { name: 'Ҳособӣ' } },
      { keyValue: 'CURR', execParams: { name: 'Ҷорӣ' } },
      { keyValue: 'BUDGET', execParams: { name: 'Буҷавӣ' } },
      { keyValue: 'SAVE', execParams: { name: 'Амонатӣ' } },
      { keyValue: 'CORR', execParams: { name: 'Мухбирӣ' } },
      // CDN_ADMINUNITTYPE
      { keyValue: 'COUNTRY', execParams: { name: 'Кишвар' } },
      { keyValue: 'DISTRICT', execParams: { name: 'Минтақа' } },
      { keyValue: 'CITY', execParams: { name: 'Шаҳр' } },
      // CDN_SEXTYPE
      { keyValue: 'F', execParams: { name: 'З' } },
      { keyValue: 'M', execParams: { name: 'М' } },
      // CDN_ADDRESS
      { keyValue: 'YUR', execParams: { name: 'Юридический адрес' } },
      { keyValue: 'PHYS', execParams: { name: 'Физический адрес' } }
    ]
  }
  loader.localizeEntity(session, localizationConfig, __filename)
}
