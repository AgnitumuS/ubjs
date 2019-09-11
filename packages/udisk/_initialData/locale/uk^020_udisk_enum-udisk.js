/**
 * @author pavel.mash
 * Enumeration localization to Ukrainian for UDISK model
 * Used by cmd\initialize command
 * @param {cmd.argv.serverSession} session
 */
module.exports = function (session) {
  const loader = require('@unitybase/base').dataLoader

  let localizationConfig = {
    entity: 'ubm_enum',
    keyAttribute: 'code',
    localization: [
      { keyValue: 'owner', execParams: { name: 'Власник' } },
      { keyValue: 'read', execParams: { name: 'Читання' } },
      { keyValue: 'write', execParams: { name: 'Зміна' } },
      { keyValue: 'delegate', execParams: { name: 'Налаштування прав' } }
    ]
  }
  loader.localizeEntity(session, localizationConfig, __filename)
}
