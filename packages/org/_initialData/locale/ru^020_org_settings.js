const loader = require('@unitybase/base').dataLoader

module.exports = function (session) {
  const localizationConfig = {
    entity: 'ubs_settings',
    keyAttribute: 'settingKey',
    localization: [
      {
        keyValue: 'org.organization.OKPORequired',
        execParams: {
          name: 'Обязательность ОКПО для организаций',
          description: 'Устанавливает обязательность кода ОКПО при создании внутренних и внешних организаций'
        }
      }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)
}
