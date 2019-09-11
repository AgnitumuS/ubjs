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
      { keyValue: 'adm_folder_misc', execParams: { caption: 'Misc' } },
      { keyValue: 'ubs_settings', execParams: { caption: 'Settings' } },
      { keyValue: 'ubs_filter', execParams: { caption: 'Saved filters' } },
      { keyValue: 'ubs_numcounter', execParams: { caption: 'Numerators' } },
      { keyValue: 'ubs_numcounterreserv', execParams: { caption: 'Numerators (reserve)' } },
      { keyValue: 'ubs_softLock', execParams: { caption: 'Blocking (SoftLocks)' } },
      { keyValue: 'ubs_report', execParams: { caption: 'Reports' } },
      { keyValue: 'ubs_globalCache', execParams: { caption: 'Server-side cache' } },
      { keyValue: 'ubs_message', execParams: { caption: 'Messages' } }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)
}
