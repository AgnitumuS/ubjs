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
      { keyValue: 'owner', execParams: { name: 'Владелец' } },
      { keyValue: 'read', execParams: { name: 'Чтение' } },
      { keyValue: 'write', execParams: { name: 'Изменение' } },
      { keyValue: 'delegate', execParams: { name: 'Настройка прав' } }
    ]
  }
  loader.localizeEntity(session, localizationConfig, __filename)
}
