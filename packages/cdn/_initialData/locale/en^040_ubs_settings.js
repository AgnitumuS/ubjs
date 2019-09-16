const loader = require('@unitybase/base').dataLoader
/**
 * Settings localization to English for CDN model
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
          name: 'Comma separated list of roles',
          description: 'Comma separated list of roles who can add rows to `cdn_organigation` with types `cdn_orgbusinesstype.isGovAuthority`' }
      },
      { keyValue: 'cdn.organization.allowAutoGenerateOKPO',
        execParams: {
          name: 'Allow automatically generation of cdn_organization.OKPOCode value',
          description: 'Allow automatically generation of cdn_organization.OKPOCode value' }
      }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)
}
