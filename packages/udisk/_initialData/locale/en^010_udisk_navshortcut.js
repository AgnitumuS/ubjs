const loader = require('@unitybase/base').dataLoader
/**
 * @author pavel.mash
 * Navigation shortcuts localization to English for UDISK model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let localizationConfig = {
    entity: 'ubm_desktop',
    keyAttribute: 'code',
    localization: [
      { keyValue: 'udisk_desktop', execParams: { caption: 'UDISK' } }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)

  localizationConfig = {
    entity: 'ubm_navshortcut',
    keyAttribute: 'code',
    localization: [
      { keyValue: 'UDISK_CARD', execParams: { caption: 'UDISK' } },
      { keyValue: 'UDISK_CARD_ADM', execParams: { caption: 'UDISK admin' } },
      { keyValue: 'UDISK_SERVICECARD', execParams: { caption: 'Service UDISK' } },
      { keyValue: 'UDISK_SERVICECARD_ADM', execParams: { caption: 'Service UDISK admin' } },
      { keyValue: 'UDISK_SECRETECARD', execParams: { caption: 'Secret UDISK' } },
      { keyValue: 'UDISK_SECRETCARD_ADM', execParams: { caption: 'Secret UDISK admin' } }
    ]
  }
}