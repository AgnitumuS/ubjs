const loader = require('@unitybase/base').dataLoader
/**
 * Enumeration localization to English for CDN model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let localizationConfig = {
    entity: 'ubm_enum',
    keyAttribute: 'code',
    localization: [
      // CDN_ACCOUNTTYPE
      { keyValue: 'CHECK', execParams: { name: 'Normaal' } },
      { keyValue: 'CURR', execParams: { name: 'Aan het controleren' } },
      { keyValue: 'BUDGET', execParams: { name: 'Budget' } },
      { keyValue: 'SAVE', execParams: { name: 'Aanbetaling' } },
      { keyValue: 'CORR', execParams: { name: 'Correspondent' } },
      // CDN_ADMINUNITTYPE
      { keyValue: 'COUNTRY', execParams: { name: 'Land' } },
      { keyValue: 'DISTRICT', execParams: { name: 'Wijk' } },
      { keyValue: 'CITY', execParams: { name: 'Stad' } },
      // CDN_SEXTYPE
      { keyValue: 'F', execParams: { name: 'Vrouwelijk' } },
      { keyValue: 'M', execParams: { name: 'Mannelijk' } },
      // CDN_ADDRESS
      { keyValue: 'YUR', execParams: { name: 'Legaal adres' } },
      { keyValue: 'PHYS', execParams: { name: 'Fysiek adres' } }
    ]
  }
  loader.localizeEntity(session, localizationConfig, __filename)
}
