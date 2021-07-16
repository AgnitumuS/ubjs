const loader = require('@unitybase/base').dataLoader
/**
 * cdn_contacttype dicionary localization to English for CDN model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let localizationConfig = {
    entity: 'cdn_contacttype',
    keyAttribute: 'code',
    localization: [
      { keyValue: 'email', execParams: { name: 'E-mail' } },
      { keyValue: 'legalAddr', execParams: { name: 'Legaal adres' } },
      { keyValue: 'actualAddr', execParams: { name: 'Werkelijk adres' } },
      { keyValue: 'phone', execParams: { name: 'Telefoon' } },
      { keyValue: 'mobPhone', execParams: { name: 'Mobiel nummer' } },
      { keyValue: 'filName', execParams: { name: 'Filialnummer' } }
    ]
  }
  loader.localizeEntity(session, localizationConfig, __filename)
}
