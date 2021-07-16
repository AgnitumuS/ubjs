const loader = require('@unitybase/base').dataLoader
/**
 * @author pavel.mash
 * Navigation shortcuts localization to English for UBS model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let localizationConfig = {
    entity: 'ubm_navshortcut',
    keyAttribute: 'code',
    localization: [
      { keyValue: 'adm_folder_misc', execParams: { caption: 'Diversen' } },
      { keyValue: 'ubs_settings', execParams: { caption: 'Instellingen' } },
      { keyValue: 'ubs_filter', execParams: { caption: 'Opgeslagen filters' } },
      { keyValue: 'ubs_numcounter', execParams: { caption: 'Tellers' } },
      { keyValue: 'ubs_numcounterreserv', execParams: { caption: 'Tellers (reserve)' } },
      { keyValue: 'ubs_softLock', execParams: { caption: 'Blokkeren (SoftLocks)' } },
      { keyValue: 'ubs_report', execParams: { caption: 'Rapporten' } },
      { keyValue: 'ubs_globalCache', execParams: { caption: 'Cache aan serverzijde' } },
      { keyValue: 'ubs_message', execParams: { caption: 'Berichten' } }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)
}
