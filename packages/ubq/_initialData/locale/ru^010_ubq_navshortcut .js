const loader = require('@unitybase/base').dataLoader
/**
 * @author pavel.mash
 * Navigation shortcuts localization to Russian for UBQ model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let localizationConfig = {
    entity: 'ubm_navshortcut',
    keyAttribute: 'code',
    localization: [
      { keyValue: 'adm_folder_UBQ', execParams: { caption: 'Очереди сообщений' } },
      { keyValue: 'ubq_messages', execParams: { caption: 'Очередь' } },
      { keyValue: 'ubq_runstat', execParams: { caption: 'Статистика' } },
      { keyValue: 'ubq_scheduler', execParams: { caption: 'Планировщики задач' } }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)
}
