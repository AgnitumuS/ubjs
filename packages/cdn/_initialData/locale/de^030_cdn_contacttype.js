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
      { keyValue: 'legalAddr', execParams: { name: 'Firmensitz' } },
      { keyValue: 'actualAddr', execParams: { name: 'Hausanschrift' } },
      { keyValue: 'phone', execParams: { name: 'Telefon' } },
      { keyValue: 'mobPhone', execParams: { name: 'Mobiltelefon' } },
      { keyValue: 'filName', execParams: { name: 'Nummer der Filiale' } }
    ]
  }
  loader.localizeEntity(session, localizationConfig, __filename)
}
