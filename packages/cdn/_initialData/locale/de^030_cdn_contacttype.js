const loader = require('@unitybase/base').dataLoader
/**
 * cdn_contacttype dicionary localization to German for CDN model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let localizationConfig = {
    entity: 'cdn_contacttype',
    keyAttribute: 'code',
    localization: [
      { keyValue: 'email', execParams: { name: 'E-mail' } },
      { keyValue: 'legalAddr', execParams: { name: 'Juristische Adresse' } },
      { keyValue: 'actualAddr', execParams: { name: 'Actual address' } },
      { keyValue: 'phone', execParams: { name: 'Telefon' } },
      { keyValue: 'mobPhone', execParams: { name: 'Mobile' } },
      { keyValue: 'filName', execParams: { name: 'Filial number' } }
    ]
  }
  loader.localizeEntity(session, localizationConfig, __filename)
}
