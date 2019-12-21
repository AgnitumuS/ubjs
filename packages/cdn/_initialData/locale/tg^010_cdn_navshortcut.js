const loader = require('@unitybase/base').dataLoader
/**
 * @author pavel.mash
 * Navigation shortcuts localization to Tajik for CDN model
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
          caption: 'Маълумотномаҳои умумӣ',
          description: 'Директорияи фанҳо, суроғаҳо, таснифоти дигар'
        }
      }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)

  localizationConfig = {
    entity: 'ubm_navshortcut',
    keyAttribute: 'code',
    localization: [
      { keyValue: 'cdn_folder_territorial', execParams: { caption: 'Воҳиди маъмурӣ' } },
      { keyValue: 'cdn_region', execParams: { caption: 'Ноҳияҳо' } },
      { keyValue: 'cdn_city', execParams: { caption: 'Маҳаллаҳои ахолинишин' } },
      { keyValue: 'cdn_country', execParams: { caption: 'Кишварҳо' } },
      { keyValue: 'cdn_adminunit', execParams: { caption: 'Воҳидҳои маъмурӣ' } },
      { keyValue: 'cdn_street', execParams: { caption: 'Кӯчаҳо' } },
      { keyValue: 'cdn_regiontype', execParams: { caption: 'Намудҳои ноҳия' } },
      { keyValue: 'cdn_citytype', execParams: { caption: 'Намудҳои маҳаллаҳои аҳолинишин' } },
      { keyValue: 'cdn_folder_subjects', execParams: { caption: 'Субъектҳо' } },
      { keyValue: 'cdn_organization', execParams: { caption: 'Ташкилотҳо' } },
      { keyValue: 'cdn_employee', execParams: { caption: 'Коргарон' } },
      { keyValue: 'cdn_department', execParams: { caption: 'Шӯъбаҳо' } },
      { keyValue: 'cdn_person', execParams: { caption: 'Шахси воқъеи' } },
      { keyValue: 'cdn_bank', execParams: { caption: 'Бонкҳо' } },
      { keyValue: 'cdn_folder_misc', execParams: { caption: 'Гуногун' } },
      { keyValue: 'cdn_currency', execParams: { caption: 'Асъорҳо' } },
      { keyValue: 'cdn_language', execParams: { caption: 'Забонҳо' } },
      { keyValue: 'cdn_classifier', execParams: { caption: 'Таснифотгарҳо' } }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)
}
