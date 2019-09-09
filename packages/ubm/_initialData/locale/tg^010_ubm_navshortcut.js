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
      { keyValue: 'ubm_enum', execParams: { caption: 'Перечисления' } },
      { keyValue: 'ubm_desktop', execParams: { caption: 'Рабочие столы' } },
      { keyValue: 'ubm_navshortcut', execParams: { caption: 'Ярлыки' } },
      { keyValue: 'ubm_diagram', execParams: { caption: 'ER диаграммы' } },
      { keyValue: 'ubm_form', execParams: { caption: 'Формы' } }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)
}
