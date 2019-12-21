const loader = require('@unitybase/base').dataLoader
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
      { keyValue: 'cdn_desktop',
        execParams: {
          caption: 'Общие справочники',
          description: 'Справочники субъектов, адресов, прочие классификаторы'
        }
      }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)

  localizationConfig = {
    entity: 'ubm_navshortcut',
    keyAttribute: 'code',
    localization: [
      { keyValue: 'cdn_folder_territorial', execParams: { caption: 'Админ. деление' } },
      { keyValue: 'cdn_region', execParams: { caption: 'Регионы' } },
      { keyValue: 'cdn_city', execParams: { caption: 'Населенные пункты' } },
      { keyValue: 'cdn_country', execParams: { caption: 'Страны' } },
      { keyValue: 'cdn_adminunit', execParams: { caption: 'Админ. единицы' } },
      { keyValue: 'cdn_street', execParams: { caption: 'Улицы' } },
      { keyValue: 'cdn_regiontype', execParams: { caption: 'Типы регионов' } },
      { keyValue: 'cdn_citytype', execParams: { caption: 'Типы нас. пунктов' } },
      { keyValue: 'cdn_folder_subjects', execParams: { caption: 'Субъекты' } },
      { keyValue: 'cdn_organization', execParams: { caption: 'Организации' } },
      { keyValue: 'cdn_employee', execParams: { caption: 'Сотрудники' } },
      { keyValue: 'cdn_department', execParams: { caption: 'Подразделения' } },
      { keyValue: 'cdn_person', execParams: { caption: 'Физические лица' } },
      { keyValue: 'cdn_bank', execParams: { caption: 'Банки' } },
      { keyValue: 'cdn_folder_misc', execParams: { caption: 'Разное' } },
      { keyValue: 'cdn_currency', execParams: { caption: 'Валюты' } },
      { keyValue: 'cdn_language', execParams: { caption: 'Языки' } },
      { keyValue: 'cdn_classifier', execParams: { caption: 'Классификаторы' } }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)
}
