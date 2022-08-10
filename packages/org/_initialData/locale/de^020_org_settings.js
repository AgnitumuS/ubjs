const loader = require('@unitybase/base').dataLoader

module.exports = function (session) {
  const localizationConfig = {
    entity: 'ubs_settings',
    keyAttribute: 'settingKey',
    localization: [
      {
        keyValue: 'org.organization.OKPORequired',
        execParams: {
          name: 'Obligatorisches CCEO für Organisationen',
          description: 'Legt den obligatorischen CCEO-Code beim Erstellen interner und externer Organisationen fest'
        }
      }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)
}
