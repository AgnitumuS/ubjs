const loader = require('@unitybase/base').dataLoader
/**
 * Settings localization to German for CDN model
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
          name: 'Kommagetrennte Liste von Rollen',
          description: '*ERFORDERT NEUSTART DES SERVERS*. Kommagetrennte Liste der Rollen, die Zeilen zu `cdn_organigation` mit den Typen `cdn_orgbusinesstype.isGovAuthority` hinzufügen können' }
      },
      { keyValue: 'cdn.organization.allowAutoGenerateOKPO',
        execParams: {
          name: 'Automatische Generierung des Wertes cdn_organization.OKPOCode erlauben',
          description: 'Automatische Generierung des Wertes cdn_organization.OKPOCode erlauben' }
      }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)
}
