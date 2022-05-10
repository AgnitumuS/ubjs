const loader = require('@unitybase/base').dataLoader
/**
 * Enumeration localization to German for CDN model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let localizationConfig = {
    entity: 'ubm_enum',
    keyAttribute: 'code',
    localization: [
      // CDN_ACCOUNTTYPE
      { keyValue: 'CHECK', execParams: { name: 'Normal' } },
      { keyValue: 'CURR', execParams: { name: 'Geschäftskonto' } },
      { keyValue: 'BUDGET', execParams: { name: 'Budget' } },
      { keyValue: 'SAVE', execParams: { name: 'Anlagekonto' } },
      { keyValue: 'CORR', execParams: { name: 'Korrespondenzkonto' } },
      // CDN_ADMINUNITTYPE
      { keyValue: 'COUNTRY', execParams: { name: 'Land' } },
      { keyValue: 'DISTRICT', execParams: { name: 'Bezirk' } },
      { keyValue: 'CITY', execParams: { name: 'Stadt' } },
      // CDN_SEXTYPE
      { keyValue: 'F', execParams: { name: 'Weiblich' } },
      { keyValue: 'M', execParams: { name: 'Männlich' } },
      // CDN_ADDRESS
      { keyValue: 'YUR', execParams: { name: 'Juristische Adresse' } },
      { keyValue: 'PHYS', execParams: { name: 'Physische Adresse' } }
    ]
  }
  loader.localizeEntity(session, localizationConfig, __filename)
}
