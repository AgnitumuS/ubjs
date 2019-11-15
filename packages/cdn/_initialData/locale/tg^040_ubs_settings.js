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
          name: 'Рӯйхати ролҳоро бо вергул ҷудо кунед',
          description: ' Рӯйхати ролҳо бо вергул ҷудо карда шудаанд, ки ба онҳо сабтҳо илова карда метавонанд `cdn_organigation` с типом `cdn_orgbusinesstype.isGovAuthority`' }
	    },
      { keyValue: 'cdn.organization.allowAutoGenerateOKPO',
        execParams: {
          name: 'Насли худкори РУКТ (OKPO), агар муайян нашуда бошад',
          description: 'Насли худкори РУКТ (OKPO), агар онро корбар муқаррар накарда бошад' }
	    }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)
}
