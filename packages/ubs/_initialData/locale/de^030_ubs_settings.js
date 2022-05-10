const loader = require('@unitybase/base').dataLoader
/**
 * @author pavel.mash
 * Settings localization to German for UBS model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let localizationConfig = {
    entity: 'ubs_settings',
    keyAttribute: 'settingKey',
    localization: [
      {
        keyValue: 'ubs.numcounter.autoRegWithDeletedNumber',
        execParams: {
          name: 'Automatisch registrieren innerhalb der gelöschten Nummer',
          description: 'Bei der Erstregistrierung nimmt das System die Nummer aus dem Wörterbuch "Gelöschte und reservierte Nummern" für diesen Schlüssel'
        }
      }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)
}
