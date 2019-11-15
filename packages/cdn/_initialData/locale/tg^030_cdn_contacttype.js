const loader = require('@unitybase/base').dataLoader
/**
 * @author pavel.mash
 * cdn_contacttype dicionary localization to Tajik for CDN model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let localizationConfig = {
    entity: 'cdn_contacttype',
    keyAttribute: 'code',
    localization: [
      { keyValue: 'email', execParams: { name: 'Суроғаи почтаи электронӣ' } },
      { keyValue: 'legalAddr', execParams: { name: 'Суроғаи ҳуқуқӣ' } },
      { keyValue: 'actualAddr', execParams: { name: 'Суроғаи воқеӣ' } },
      { keyValue: 'phone', execParams: { name: 'Телефон' } },
      { keyValue: 'mobPhone', execParams: { name: 'Телефони мобилӣ' } },
      { keyValue: 'filName', execParams: { name: 'Рақами шӯъба' } }
    ]
  }
  loader.localizeEntity(session, localizationConfig, __filename)
}
