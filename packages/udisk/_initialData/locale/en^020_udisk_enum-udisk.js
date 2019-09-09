/**
 * @author pavel.mash
 * Enumeration localization to English for UDISK model
 * Used by cmd\initialize command
 * @param {cmd.argv.serverSession} session
 */
module.exports = function (session) {
  const loader = require('@unitybase/base').dataLoader

  let localizationConfig = {
    entity: 'ubm_enum',
    keyAttribute: 'code',
    localization: [
      { keyValue: 'owner', execParams: { name: 'Owner' } },
      { keyValue: 'read', execParams: { name: 'Read' } },
      { keyValue: 'write', execParams: { name: 'Write' } },
      { keyValue: 'delegate', execParams: { name: 'Delegate' } }
    ]
  }
  loader.localizeEntity(session, localizationConfig, __filename)
}
