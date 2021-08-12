const loader = require('@unitybase/base').dataLoader
/**
 * @author pavel.mash
 * Enumeration localization to English for UBS model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let localizationConfig = {
    entity: 'ubm_enum',
    keyAttribute: 'eGroup;code',
    localization: [
      // UBS_MESSAGE_TYPE
      { keyValue: 'UBS_MESSAGE_TYPE;user', execParams: { name: 'Door gebruikers' } },
      { keyValue: 'UBS_MESSAGE_TYPE;system', execParams: { name: 'Systeem' } },
      { keyValue: 'UBS_MESSAGE_TYPE;warning', execParams: { name: 'Waarschuwing' } },
      { keyValue: 'UBS_MESSAGE_TYPE;information', execParams: { name: 'Informatie' } }
    ]
  }
  loader.localizeEntity(session, localizationConfig, __filename)
}
