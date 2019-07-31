const loader = require('@unitybase/base').dataLoader
/**
 * @author pavel.mash
 * Navigation shortcuts localization to Ukrainian for UBS model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let localizationConfig = {
    entity: 'ubs_settings',
    keyAttribute: 'settingKey',
    localization: [
      { keyValue: 'cdn.organization.accessAddGovByRoles',
        execParams: {
          name: 'Список ролей розділених комою',
          description: 'Список ролей(через кому) що можуть додавати записи в `cdn_organigation` з типом `cdn_orgbusinesstype.isGovAuthority`' }
      },
      { keyValue: 'cdn.organization.allowAutoGenerateOKPO',
        execParams: {
          name: 'Автоматична генерація ЗКПО (якщо не вказано)',
          description: 'Автоматична генерація значення поля ЗКПО у випадку якщо значення не вказане користувачем' }
      }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)
}
