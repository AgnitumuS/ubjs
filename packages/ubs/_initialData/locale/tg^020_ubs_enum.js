const loader = require('@unitybase/base').dataLoader
/**
 * @author pavel.mash
 * Enumeration localization to Tajik for UBS model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let localizationConfig = {
    entity: 'ubm_enum',
    keyAttribute: 'eGroup;code',
    localization: [
      // UBS_MESSAGE_TYPE
      { keyValue: 'UBS_MESSAGE_TYPE;user', execParams: { name: 'Пользовательское' } },
      { keyValue: 'UBS_MESSAGE_TYPE;system', execParams: { name: 'Система' } },
      { keyValue: 'UBS_MESSAGE_TYPE;warning', execParams: { name: 'Предупреждение' } },
      { keyValue: 'UBS_MESSAGE_TYPE;information', execParams: { name: 'Информация' } }
    ]
  }
  loader.localizeEntity(session, localizationConfig, __filename)
}
