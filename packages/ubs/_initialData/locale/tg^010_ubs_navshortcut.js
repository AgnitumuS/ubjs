const loader = require('@unitybase/base').dataLoader
/**
 * @author pavel.mash
 * Navigation shortcuts localization to Tajik for UBS model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let localizationConfig = {
    entity: 'ubm_navshortcut',
    keyAttribute: 'code',
    localization: [
      { keyValue: 'adm_folder_misc', execParams: { caption: 'Гуногун' } },
      { keyValue: 'ubs_settings', execParams: { caption: 'Танзимот' } },
      { keyValue: 'ubs_filter', execParams: { caption: 'Филтрҳои ҳифзшуда' } },
      { keyValue: 'ubs_numcounter', execParams: { caption: 'Рақамгузорӣ' } },
      { keyValue: 'ubs_numcounterreserv', execParams: { caption: 'Рақамгузорӣ (захира)' } },
      { keyValue: 'ubs_softLock', execParams: { caption: 'Худбандӣ (SoftLocks)' } },
      { keyValue: 'ubs_report', execParams: { caption: 'Ҳисоботҳо' } },
      { keyValue: 'ubs_globalCache', execParams: { caption: 'Серверный кэш' } },
      { keyValue: 'ubs_message', execParams: { caption: 'Паёмҳо' } }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)
}
