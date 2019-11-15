const loader = require('@unitybase/base').dataLoader
/**
 * @author pavel.mash
 * Navigation shortcuts localization to Tajik for UBQ model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let localizationConfig = {
    entity: 'ubm_navshortcut',
    keyAttribute: 'code',
    localization: [
      { keyValue: 'adm_folder_UBQ', execParams: { caption: 'Навбати паёмҳо' } },
      { keyValue: 'ubq_messages', execParams: { caption: 'Навбат' } },
      { keyValue: 'ubq_runstat', execParams: { caption: 'Омор' } },
      { keyValue: 'ubq_scheduler', execParams: { caption: 'Нақшакашҳои вазифаҳо' } }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)
}
