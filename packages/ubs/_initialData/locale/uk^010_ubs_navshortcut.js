const loader = require('@unitybase/base').dataLoader
/**
 * @author pavel.mash
 * Navigation shortcuts localization to Ukrainian for UBS model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let localizationConfig = {
    entity: 'ubm_navshortcut',
    keyAttribute: 'code',
    localization: [
  	    { keyValue: 'adm_folder_misc', execParams: { caption: 'Різне' } },
      { keyValue: 'ubs_settings', execParams: { caption: 'Налаштування' } },
      { keyValue: 'ubs_filter', execParams: { caption: 'Збережені фільтри' } },
      { keyValue: 'ubs_numcounter', execParams: { caption: 'Нумератори' } },
      { keyValue: 'ubs_numcounterreserv', execParams: { caption: 'Нумератори (резерв)' } },
      { keyValue: 'ubs_softLock', execParams: { caption: 'Блокування (SoftLocks)' } },
      { keyValue: 'ubs_report', execParams: { caption: 'Звіти' } },
      { keyValue: 'ubs_message', execParams: { caption: 'Повідомлення' } }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)
}
