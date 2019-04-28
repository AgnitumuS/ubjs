/**
 * @author pavel.mash
 * Enumeration localization to Ukrainian for ORG model
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
      { keyValue: 'write', execParams: { name: 'Змінення' } },
      { keyValue: 'delegate', execParams: { name: 'Налагодження прав' } }
    ]
  }
  loader.localizeEntity(session, localizationConfig, __filename)
}
