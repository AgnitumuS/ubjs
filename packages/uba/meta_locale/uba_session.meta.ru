{
  "caption": "Сессии пользователей",
  "description": "Список активных пользовательских сессий",
  "documentation": "Список активных пользовательских сессий",
  "attributes": [
    {
      "name": "ID",
      "caption": "ID сессии"
    },
    {
      "name": "userID",
      "caption": "ID полозователя"
    },
    {
      "name": "userName",
      "caption": "Имя пользоваетля"
    },
    {
      "name": "remoteIP",
      "caption": "IP адрес",
      "description": "IP адрес с которого создана сессия"
    },
    {
      "name": "isPasswordExpired",
      "caption": "Срок пароля истек",
      "description": "Верно, если пользователю необходимо изменить пароль из-за истечения срока его действия"
    },
    {
      "name": "isLocked",
      "caption": "Заблокирован",
      "description": "Заблокирован, поскольку максимальное количество неверных вводов пароля превышает значение параметра UBA.passwordPolicy.maxInvalidAttempts"
    },
    {
      "name": "serverTimeDelta",
      "caption": "Дельта времени",
      "description": "Дельта времени между сервером приложений и клиентским устройством"
    },
    {
      "name": "createdAt",
      "caption": "Создана",
      "description": "Время создания сессии"
    },
    {
      "name": "accessedAt",
      "caption": "Последняя активность",
      "description": "Время последней активности полозователя"
    }
  ]
}