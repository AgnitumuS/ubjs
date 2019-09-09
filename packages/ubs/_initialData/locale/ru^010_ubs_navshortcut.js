const loader = require('@unitybase/base').dataLoader
/**
 * @author pavel.mash
 * Navigation shortcuts localization to Russian for UBS model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let localizationConfig = {
    entity: 'ubm_navshortcut',
    keyAttribute: 'code',
    localization: [
      { keyValue: 'adm_folder_misc', execParams: { caption: 'Разное' } },
      { keyValue: 'ubs_settings', execParams: { caption: 'Настройки' } },
      { keyValue: 'ubs_filter', execParams: { caption: 'Сохраненные фильтры' } },
      { keyValue: 'ubs_numcounter', execParams: { caption: 'Нумераторы' } },
      { keyValue: 'ubs_numcounterreserv', execParams: { caption: 'Нумераторы (резерв)' } },
      { keyValue: 'ubs_softLock', execParams: { caption: 'Блокировки (SoftLocks)' } },
      { keyValue: 'ubs_report', execParams: { caption: 'Отчеты' } },
      { keyValue: 'ubs_globalCache', execParams: { caption: 'Серверний кэш' } },
      { keyValue: 'ubs_message', execParams: { caption: 'Сообщения' } }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)
}
