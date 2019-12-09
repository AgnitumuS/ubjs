﻿const loader = require('@unitybase/base').dataLoader
/**
 * @author pavel.mash
 * Navigation shortcuts localization to Ukrainian for CDN model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let localizationConfig = {
    entity: 'ubm_desktop',
    keyAttribute: 'code',
    localization: [
      { keyValue: 'cdn_desktop', execParams: { caption: 'Загальні довідники' } }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)

  localizationConfig = {
    entity: 'ubm_navshortcut',
    keyAttribute: 'code',
    localization: [
      { keyValue: 'cdn_folder_territorial', execParams: { caption: 'Адмін. поділ' } },
      { keyValue: 'cdn_region', execParams: { caption: 'Регіони' } },
      { keyValue: 'cdn_city', execParams: { caption: 'Населені пункти' } },
      { keyValue: 'cdn_country', execParams: { caption: 'Крaїни' } },
      { keyValue: 'cdn_adminunit', execParams: { caption: 'Адмін. одиниці' } },
      { keyValue: 'cdn_street', execParams: { caption: 'Вулиці' } },
      { keyValue: 'cdn_regiontype', execParams: { caption: 'Типи регіонів' } },
      { keyValue: 'cdn_citytype', execParams: { caption: 'Типи нас. пунктів' } },
      { keyValue: 'cdn_folder_subjects', execParams: { caption: 'Суб\'єкти' } },
      { keyValue: 'cdn_organization', execParams: { caption: 'Організації' } },
      { keyValue: 'cdn_employee', execParams: { caption: 'Співробітники' } },
      { keyValue: 'cdn_department', execParams: { caption: 'Підрозділи' } },
      { keyValue: 'cdn_person', execParams: { caption: 'Фізичні особи' } },
      { keyValue: 'cdn_bank', execParams: { caption: 'Банки' } },
      { keyValue: 'cdn_folder_misc', execParams: { caption: 'Різне' } },
      { keyValue: 'cdn_currency', execParams: { caption: 'Валюти' } },
      { keyValue: 'cdn_language', execParams: { caption: 'Мови' } },
      { keyValue: 'cdn_classifier', execParams: { caption: 'Класифікатори' } }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)
}
