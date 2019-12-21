const loader = require('@unitybase/base').dataLoader

/**
 * Navigation shortcuts localization to Russian for UBA model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  function localize (localizationConfig) {
    loader.localizeEntity(session, localizationConfig, __filename)
  }

  localize({
    entity: 'ubm_desktop',
    keyAttribute: 'code',
    localization: [{
      keyValue: 'adm_desktop',
      execParams: {
        caption: 'Администратор',
        description: 'Управление пользователями, настройки интерфейса, журналы (аудит, безопасность, очередь)'
      }
    }]
  })

  localize({
    entity: 'ubm_navshortcut',
    keyAttribute: 'code',
    localization: [
      { keyValue: 'uba_auditTrail', execParams: { caption: 'Аудит' } },
      { keyValue: 'adm_folder_users', execParams: { caption: 'Пользователи' } },
      { keyValue: 'uba_user', execParams: { caption: 'Список пользователей' } },
      { keyValue: 'uba_userrole', execParams: { caption: 'Роли пользователей' } },
      { keyValue: 'uba_advSecurity', execParams: { caption: 'Расширенная безопасность' } },
      { keyValue: 'uba_group', execParams: { caption: 'Список групп' } },
      { keyValue: 'uba_usergroup', execParams: { caption: 'Группа пользователей' } },
      { keyValue: 'uba_usercertificate', execParams: { caption: 'Сертификаты' } },
      { keyValue: 'adm_folder_security', execParams: { caption: 'Безопасность' } },
      { keyValue: 'uba_role', execParams: { caption: 'Системные роли' } },
      { keyValue: 'uba_els', execParams: { caption: 'Права на методы (ELS)' } },
      { keyValue: 'uba_audit', execParams: { caption: 'Аудит безопасности' } },
      { keyValue: 'uba_audit-securityDashboard', execParams: { caption: 'Консоль безопасности' } },
      { keyValue: 'uba_als', execParams: { caption: 'Права на атрибуты (ALS)' } },
      { keyValue: 'uba_otp', execParams: { caption: 'Одноразовые пароли (OTP)' } }
    ]
  })

  localize({
    entity: 'uba_role',
    keyAttribute: 'name',
    localization: [
      { keyValue: 'Everyone', execParams: { description: 'Кто угодно (встроенная роль)' } },
      { keyValue: 'Admin', execParams: { description: 'Администратор (встроенная роль)' } },
      { keyValue: 'Anonymous', execParams: { description: 'Неавторизированный пользователь (встроенная роль)' } },
      { keyValue: 'User', execParams: { description: 'Авторизированный пользователь (встроенная роль)' } },
      { keyValue: 'Supervisor', execParams: { description: 'Администратор безопасности (встроенная роль)' } },
      { keyValue: 'Developer', execParams: { description: 'Разработчик (встроенная роль)' } },
      { keyValue: 'Monitor', execParams: { description: 'Мониторинг (встроенная роль)' } }
    ]
  })
}
