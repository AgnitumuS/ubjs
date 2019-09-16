const loader = require('@unitybase/base').dataLoader

/**
 * Navigation shortcuts localization to Tajik for UBA model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let localizationConfig = {
    entity: 'ubm_desktop',
    keyAttribute: 'code',
    localization: [
      { keyValue: 'adm_desktop', execParams: { caption: 'Администратор' } }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)

  localizationConfig = {
    entity: 'ubm_navshortcut',
    keyAttribute: 'code',
    localization: [
      { keyValue: 'uba_auditTrail', execParams: { caption: 'Аудит' } },
      { keyValue: 'adm_folder_users', execParams: { caption: 'Истифодабарандагон' } },
      { keyValue: 'uba_user', execParams: { caption: 'Рӯйхати истифодабарандагон' } },
      { keyValue: 'uba_userrole', execParams: { caption: 'Ролҳои истифодабарандагон' } },
      { keyValue: 'uba_advSecurity', execParams: { caption: 'Амнияти васеъ' } },
      { keyValue: 'uba_group', execParams: { caption: 'Рӯйхати гурӯҳҳо' } },
      { keyValue: 'uba_usergroup', execParams: { caption: 'Гурӯҳи истифодабарандагон' } },
      { keyValue: 'uba_usercertificate', execParams: { caption: 'Сертификатҳо' } },
      { keyValue: 'adm_folder_security', execParams: { caption: 'Бехатарӣ' } },
      { keyValue: 'uba_role', execParams: { caption: 'Системные роли' } },
      { keyValue: 'uba_els', execParams: { caption: 'Права на методы (ELS)' } },
      { keyValue: 'uba_audit', execParams: { caption: 'Аудити бехатарӣ' } },
      { keyValue: 'uba_audit-securityDashboard', execParams: { caption: 'Консоль безопасности' } },
      { keyValue: 'uba_als', execParams: { caption: 'Ҳуқуқ ба хусусиятҳо(ALS)' } },
      { keyValue: 'uba_otp', execParams: { caption: 'Якдафъаина гузарвожаҳо (OTP)' } }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)

  localizationConfig = {
    entity: 'uba_role',
    keyAttribute: 'name',
    localization: [
      { keyValue: 'Everyone', execParams: { description: 'Кто угодно (роли дарунсохташуда)' } },
      { keyValue: 'Admin', execParams: { description: 'Администратор (роли дарунсохташуда)' } },
      { keyValue: 'Anonymous', execParams: { description: 'Истифодабарандаи беиҷозат (роли дарунсохташуда)' } },
      { keyValue: 'User', execParams: { description: 'Истифодабарандаи ваколатдор (роли дарунсохташуда)' } },
      { keyValue: 'Supervisor', execParams: { description: 'Администратор безопасности (встроенная роль)' } },
      { keyValue: 'Developer', execParams: { description: 'Разработчик (встроенная роль)' } },
      { keyValue: 'Monitor', execParams: { description: 'Мониторинг (встроенная роль)' } }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)
}
