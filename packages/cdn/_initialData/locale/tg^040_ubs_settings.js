const loader = require('@unitybase/base').dataLoader
/**
 * @author pavel.mash
 * Settings localization to Tajik for CDN model
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
          name: 'Список ролей через запятую',
          description: 'Список ролей через запятую которые могут добавлять записи в `cdn_organigation` с типом `cdn_orgbusinesstype.isGovAuthority`' }
	    },
      { keyValue: 'cdn.organization.allowAutoGenerateOKPO',
        execParams: {
          name: 'Автоматическая генерация ОКПО если он не указан',
          description: 'Автоматическая генерация ОКПО если он не указан пользователем' }
	    }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)
}
