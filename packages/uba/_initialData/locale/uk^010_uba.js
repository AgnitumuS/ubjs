const loader = require('@unitybase/base').dataLoader

/**
 * Navigation shortcuts localization to Ukrainian for UBA model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let localizationConfig = {
    entity: 'ubm_desktop',
    keyAttribute: 'code',
    localization: [
      { keyValue: 'adm_desktop', execParams: { caption: 'Адміністратор' } }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)

  localizationConfig = {
    entity: 'ubm_navshortcut',
    keyAttribute: 'code',
    localization: [
      { keyValue: 'uba_auditTrail', execParams: { caption: 'Аудит' } },
      { keyValue: 'adm_folder_users', execParams: { caption: 'Користувачі' } },
      { keyValue: 'uba_user', execParams: { caption: 'Список користувачів' } },
      { keyValue: 'uba_userrole', execParams: { caption: 'Ролі користувачів' } },
      { keyValue: 'uba_advSecurity', execParams: { caption: 'Додаткова безпека' } },
      { keyValue: 'uba_group', execParams: { caption: 'Список груп' } },
      { keyValue: 'uba_usergroup', execParams: { caption: 'Групи користувачів' } },
      { keyValue: 'uba_usercertificate', execParams: { caption: 'Сертифікати' } },
      { keyValue: 'adm_folder_security', execParams: { caption: 'Безпека' } },
      { keyValue: 'uba_role', execParams: { caption: 'Системні ролі' } },
      { keyValue: 'uba_els', execParams: { caption: 'Права на методи (ELS)' } },
      { keyValue: 'uba_audit', execParams: { caption: 'Аудит безпеки' } },
      { keyValue: 'uba_audit-securityDashboard', execParams: { caption: 'Консоль безпеки' } },
      { keyValue: 'uba_als', execParams: { caption: 'Права на атрибути (ALS)' } },
      { keyValue: 'uba_otp', execParams: { caption: 'Одноразові паролі (OTP)' } }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)

  localizationConfig = {
    entity: 'uba_role',
    keyAttribute: 'name',
    localization: [
      { keyValue: 'Everyone', execParams: { description: 'Будь хто (вбудована роль)' } },
      { keyValue: 'Admin', execParams: { description: 'Адміністратор (вбудована роль)' } },
      { keyValue: 'Anonymous', execParams: { description: 'Неавторизований користувач (вбудована роль)' } },
      { keyValue: 'User', execParams: { description: 'Авторизований користувач (вбудована роль)' } },
      { keyValue: 'Supervisor', execParams: { description: 'Адміністратор безпеки (вбудована роль)' } },
      { keyValue: 'Developer', execParams: { description: 'Розробник (вбудована роль)' } },
      { keyValue: 'Monitor', execParams: { description: 'Моніторинг (вбудована роль)' } }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)
}
