const loader = require('@unitybase/base').dataLoader
/**
 * @author pavel.mash
 * Enumeration localization to Russian for CDN model
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
      { keyValue: 'CURR', execParams: { name: 'Текущий' } },
      { keyValue: 'BUDGET', execParams: { name: 'Бюджетный' } },
      { keyValue: 'SAVE', execParams: { name: 'Депозитный' } },
      { keyValue: 'CORR', execParams: { name: 'Корреспондентский' } },
      // CDN_ADMINUNITTYPE
      { keyValue: 'COUNTRY', execParams: { name: 'Страна' } },
      { keyValue: 'DISTRICT', execParams: { name: 'Регион' } },
      { keyValue: 'CITY', execParams: { name: 'Город' } },
      // CDN_SEXTYPE
      { keyValue: 'F', execParams: { name: 'Женщина' } },
      { keyValue: 'M', execParams: { name: 'Мужчина' } },
      // CDN_ADDRESS
      { keyValue: 'YUR', execParams: { name: 'Юридический адрес' } },
      { keyValue: 'PHYS', execParams: { name: 'Физический адрес' } }
    ]
  }
  loader.localizeEntity(session, localizationConfig, __filename)
}
