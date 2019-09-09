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
      { keyValue: 'email', execParams: { name: 'Электронный адрес' } },
      { keyValue: 'legalAddr', execParams: { name: 'Юридический адрес' } },
      { keyValue: 'actualAddr', execParams: { name: 'Фактический адрес' } },
      { keyValue: 'phone', execParams: { name: 'Телефон' } },
      { keyValue: 'mobPhone', execParams: { name: 'Мобильный телефон' } },
      { keyValue: 'filName', execParams: { name: 'Номер Филиала' } }
    ]
  }
  loader.localizeEntity(session, localizationConfig, __filename)
}
