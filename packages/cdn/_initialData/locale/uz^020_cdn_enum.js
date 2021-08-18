const loader = require('@unitybase/base').dataLoader
/**
 * @author pavel.mash
 * Enumeration localization to O'zbek for CDN model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let localizationConfig = {
    entity: 'ubm_enum',
    keyAttribute: 'code',
    localization: [
      // CDN_ACCOUNTTYPE
      { keyValue: 'CHECK', execParams: { name: 'Taxminiy' } },
      { keyValue: 'CURR', execParams: { name: 'Hozirgi' } },
      { keyValue: 'BUDGET', execParams: { name: 'Byudjet' } },
      { keyValue: 'SAVE', execParams: { name: 'Depozit' } },
      { keyValue: 'CORR', execParams: { name: 'Muxbir' } },
      // CDN_ADMINUNITTYPE
      { keyValue: 'COUNTRY', execParams: { name: 'Mamlakat' } },
      { keyValue: 'DISTRICT', execParams: { name: 'Hudud' } },
      { keyValue: 'CITY', execParams: { name: 'Shahar' } },
      // CDN_SEXTYPE
      { keyValue: 'F', execParams: { name: 'Ayol' } },
      { keyValue: 'M', execParams: { name: 'Erkak' } },
      // CDN_ADDRESS
      { keyValue: 'YUR', execParams: { name: 'Yuridik manzil' } },
      { keyValue: 'PHYS', execParams: { name: 'Jismoniy manzil' } }
    ]
  }
  loader.localizeEntity(session, localizationConfig, __filename)
}
