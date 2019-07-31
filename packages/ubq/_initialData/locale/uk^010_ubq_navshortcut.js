const loader = require('@unitybase/base').dataLoader
/**
 * @author pavel.mash
 * Navigation shortcuts localization to Ukrainian for UBQ model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let localizationConfig = {
    entity: 'ubm_navshortcut',
    keyAttribute: 'code',
    localization: [
      { keyValue: 'adm_folder_UBQ', execParams: { caption: 'Черги повідомлень' } },
      { keyValue: 'ubq_messages', execParams: { caption: 'Черга' } },
      { keyValue: 'ubq_runstat', execParams: { caption: 'Статистика' } },
      { keyValue: 'ubq_scheduler', execParams: { caption: 'Планувальники задач' } }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)
}
