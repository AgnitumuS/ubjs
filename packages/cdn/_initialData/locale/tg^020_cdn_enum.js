﻿const loader = require('@unitybase/base').dataLoader
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
      { keyValue: 'CURR', execParams: { name: 'Текущий' } },
      { keyValue: 'BUDGET', execParams: { name: 'Бюджетный' } },
      { keyValue: 'SAVE', execParams: { name: 'Депозитный' } },
      { keyValue: 'CORR', execParams: { name: 'Корреспондентский' } },
      // CDN_ADMINUNITTYPE
      { keyValue: 'COUNTRY', execParams: { name: 'Страна' } },
      { keyValue: 'DISTRICT', execParams: { name: 'Регион' } },
      { keyValue: 'CITY', execParams: { name: 'Город' } },
      { keyValue: 'F', execParams: { name: 'Ж' } },
      { keyValue: 'M', execParams: { name: 'М' } }
    ]
  }
  loader.localizeEntity(session, localizationConfig, __filename)
}
