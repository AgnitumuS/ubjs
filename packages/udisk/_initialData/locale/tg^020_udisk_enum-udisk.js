/**
 * @author pavel.mash
 * Enumeration localization to Tajik for UDISK model
 * Used by cmd\initialize command
 * @param {cmd.argv.serverSession} session
 */
module.exports = function (session) {
  const loader = require('@unitybase/base').dataLoader

  let localizationConfig = {
    entity: 'ubm_enum',
    keyAttribute: 'code',
    localization: [
      { keyValue: 'owner', execParams: { name: 'Соҳиб' } },
      { keyValue: 'read', execParams: { name: 'Хондан' } },
      { keyValue: 'write', execParams: { name: 'Тағйир додан' } },
      { keyValue: 'delegate', execParams: { name: 'Муқаррар кардани ҳуқуқҳо' } }
    ]
  }
  loader.localizeEntity(session, localizationConfig, __filename)
}
