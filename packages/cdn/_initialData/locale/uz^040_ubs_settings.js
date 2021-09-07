const loader = require('@unitybase/base').dataLoader
/**
 * @author pavel.mash
 * Settings localization to O'zbek for CDN model
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
          name: 'Vergul bilan ajratilgan rollar ro`yxati',
          description: 'Yozuvlarni qo`shish mumkin bo`lgan rollarning vergul bilan ajratilgan ro`yxati `cdn_organigation` turi bilan `cdn_orgbusinesstype.isGovAuthority`' }
      },
      { keyValue: 'cdn.organization.allowAutoGenerateOKPO',
        execParams: {
          name: 'Agar ko`rsatilmagan bo`lsa, OKPOni avtomatik ishlab chiqarish',
          description: 'Agar foydalanuvchi ko`rsatmagan bo`lsa, OKPOni avtomatik ishlab chiqarish' }
      }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)
}
