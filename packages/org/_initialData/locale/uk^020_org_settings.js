const loader = require('@unitybase/base').dataLoader

module.exports = function (session) {
  const localizationConfig = {
    entity: 'ubs_settings',
    keyAttribute: 'settingKey',
    localization: [
      {
        keyValue: 'org.organization.OKPORequired',
        execParams: {
          name: 'Обов’язковість ЄДРПОУ для організацій',
          description: 'Встановлює обов’язковість коду ЄДРПОУ при створенні внутрішніх і зовнішніх організацій'
        }
      }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)
}
