const loader = require('@unitybase/base').dataLoader
/**
 * @author pavel.mash
 * cdn_contacttype dicionary localization to O'zbek for CDN model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let localizationConfig = {
    entity: 'cdn_contacttype',
    keyAttribute: 'code',
    localization: [
      { keyValue: 'email', execParams: { name: 'Elektron manzil' } },
      { keyValue: 'legalAddr', execParams: { name: 'Yuridik manzil' } },
      { keyValue: 'actualAddr', execParams: { name: 'Haqiqiy manzili' } },
      { keyValue: 'phone', execParams: { name: 'Telefon' } },
      { keyValue: 'mobPhone', execParams: { name: 'Uyali telefon' } },
      { keyValue: 'filName', execParams: { name: 'Filial raqami' } }
    ]
  }
  loader.localizeEntity(session, localizationConfig, __filename)
}
