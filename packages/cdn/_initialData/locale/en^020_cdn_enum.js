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
      { keyValue: 'CHECK', execParams: { name: 'Normal' } },
      { keyValue: 'CURR', execParams: { name: 'Checking' } },
      { keyValue: 'BUDGET', execParams: { name: 'Budget' } },
      { keyValue: 'SAVE', execParams: { name: 'Deposit' } },
      { keyValue: 'CORR', execParams: { name: 'Correspondent' } },
      // CDN_ADMINUNITTYPE
      { keyValue: 'COUNTRY', execParams: { name: 'Country' } },
      { keyValue: 'DISTRICT', execParams: { name: 'District' } },
      { keyValue: 'CITY', execParams: { name: 'City' } },
      // CDN_SEXTYPE
      { keyValue: 'F', execParams: { name: 'Female' } },
      { keyValue: 'M', execParams: { name: 'Male' } },
      // CDN_ADDRESS
      { keyValue: 'YUR', execParams: { name: 'Legal address' } },
      { keyValue: 'PHYS', execParams: { name: 'Physical address' } }
    ]
  }
  loader.localizeEntity(session, localizationConfig, __filename)
}
