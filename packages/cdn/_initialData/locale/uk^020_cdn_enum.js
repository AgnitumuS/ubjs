const loader = require('@unitybase/base').dataLoader
/**
 * @author pavel.mash
 * Enumeration localization to Ukrainian for CDN model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let localizationConfig = {
    entity: 'ubm_enum',
    keyAttribute: 'code',
    localization: [
      // CDN_ACCOUNTTYPE
      { keyValue: 'CHECK', execParams: { name: 'Розрахунковий' } },
      { keyValue: 'CURR', execParams: { name: 'Поточний' } },
      { keyValue: 'BUDGET', execParams: { name: 'Бюджетний' } },
      { keyValue: 'SAVE', execParams: { name: 'Депозитний' } },
      { keyValue: 'CORR', execParams: { name: 'Кореспондентський' } },
      // CDN_ADMINUNITTYPE
      { keyValue: 'COUNTRY', execParams: { name: 'Країна' } },
      { keyValue: 'DISTRICT', execParams: { name: 'Регіон' } },
      { keyValue: 'CITY', execParams: { name: 'Місто' } },
      // CDN_SEXTYPE
      { keyValue: 'F', execParams: { name: 'Жінка' } },
      { keyValue: 'M', execParams: { name: 'Чоловік' } },
      // CDN_ADDRESS
      { keyValue: 'YUR', execParams: { name: 'Юридична адреса' } },
      { keyValue: 'PHYS', execParams: { name: 'Фізична адреса' } }
    ]
  }
  loader.localizeEntity(session, localizationConfig, __filename)
}
