/**
 * @author pavel.mash
 * Enumeration localization to Ukrainian for CDN model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let loader = require('@unitybase/base').dataLoader
  let localizationConfig = {
    entity: 'cdn_contacttype',
    keyAttribute: 'code',
    localization: [
        {keyValue: 'email', execParams: {name: 'Електронна адреса'}},
        {keyValue: 'legalAddr', execParams: {name: 'Юридична адреса'}},
        {keyValue: 'actualAddr', execParams: {name: 'Фактична адреса'}},
        {keyValue: 'phone', execParams: {name: 'Телефон'}},
        {keyValue: 'mobPhone', execParams: {name: 'Мобільний телефон'}},
        {keyValue: 'filName', execParams: {name: 'Номер філії'}}
    ]
  }
  loader.localizeEntity(session, localizationConfig, __filename)
}
