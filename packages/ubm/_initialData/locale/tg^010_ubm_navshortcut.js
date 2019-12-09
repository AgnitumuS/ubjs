const loader = require('@unitybase/base').dataLoader
/**
 * @author pavel.mash
 * Navigation shortcuts localization to Tajik for UBM model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let localizationConfig = {
    entity: 'ubm_navshortcut',
    keyAttribute: 'code',
    localization: [
      { keyValue: 'adm_folder_UI', execParams: { caption: 'Интерфейс' } },
      { keyValue: 'ubm_enum', execParams: { caption: 'Номгӯҳо' } },
      { keyValue: 'ubm_desktop', execParams: { caption: 'Мизҳои корӣ' } },
      { keyValue: 'ubm_query', execParams: { caption: 'Саволҳо' } },
      { keyValue: 'ubm_navshortcut', execParams: { caption: 'Тамға' } },
      { keyValue: 'ubm_diagram', execParams: { caption: 'ER диаграммаҳо' } },
      { keyValue: 'ubm_form', execParams: { caption: 'Шаклҳо' } }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)
}
