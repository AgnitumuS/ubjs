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
      { keyValue: 'adm_desktop', execParams: { caption: 'Маъмур' } }
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
      { keyValue: 'uba_role', execParams: { caption: 'Ролҳои системавӣ' } },
      { keyValue: 'uba_els', execParams: { caption: 'Дастрасӣ ба амалкардҳо  (ELS)' } },
      { keyValue: 'uba_audit', execParams: { caption: 'Аудити бехатарӣ' } },
      { keyValue: 'uba_audit-securityDashboard', execParams: { caption: 'Консоли амният' } },
      { keyValue: 'uba_als', execParams: { caption: 'Дастрасӣ ба хусусиятҳо (ALS)' } },
      { keyValue: 'uba_otp', execParams: { caption: 'Якдафъаина гузарвожаҳо (OTP)' } }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)

  localizationConfig = {
    entity: 'uba_role',
    keyAttribute: 'name',
    localization: [
      { keyValue: 'Everyone', execParams: { description: 'Ҳама (роли дарунсохташуда)' } },
      { keyValue: 'Admin', execParams: { description: 'Маъмурӣ (роли дарунсохташуда)' } },
      { keyValue: 'Anonymous', execParams: { description: 'Истифодабарандаи беиҷозат (роли дарунсохташуда)' } },
      { keyValue: 'User', execParams: { description: 'Истифодабарандаи ваколатдор (роли дарунсохташуда)' } },
      { keyValue: 'Supervisor', execParams: { description: 'Маъмур оид ба амният (роли дарунсохт)' } },
      { keyValue: 'Developer', execParams: { description: 'Таҳиякунанда  (роли дарунсохт)' } },
      { keyValue: 'Monitor', execParams: { description: 'Мониторинг (роли дарунсохт)' } }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)
}
