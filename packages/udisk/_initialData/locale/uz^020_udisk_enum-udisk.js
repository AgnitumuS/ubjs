/**
 * @author pavel.mash
 * Enumeration localization to Russian for UDISK model
 * Used by cmd\initialize command
 * @param {cmd.argv.serverSession} session
 */
module.exports = function (session) {
  const loader = require('@unitybase/base').dataLoader

  let localizationConfig = {
    entity: 'ubm_enum',
    keyAttribute: 'code',
    localization: [
      { keyValue: 'owner', execParams: { name: 'Egasi' } },
      { keyValue: 'read', execParams: { name: 'O`qish' } },
      { keyValue: 'write', execParams: { name: 'O`zgartirish' } },
      { keyValue: 'delegate', execParams: { name: 'Huquqlarni sozlash' } }
    ]
  }
  loader.localizeEntity(session, localizationConfig, __filename)
}
