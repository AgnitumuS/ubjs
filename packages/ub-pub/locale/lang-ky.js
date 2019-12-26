/* global UB */
UB.i18nExtend({
  ok: 'ОК',
  cancel: 'Отмена',
  Yes: 'Да',
  No: 'Нет',
  Enter: 'Войти',
  Password: 'Пароль',
  User: 'Имя пользователя',
  UBAuthTip: "Введите имя пользователя, пароль и нажмите 'Войти'",
  UBAuthHeader: 'Вход через учетную запись <br/> {0}',
  UBAuthForgotPassword: 'Забыли пароль?',
  UBAuthRegistration: 'Регистрация',
  UBAuthContinue: 'Продолжить',
  KerberosRemember: 'Запомнить способ входа',
  KerberosRememberUserMenu: 'Всегда входить по домену',
  KerberosHeader: 'Вход через учетную запись <br/> операционной системы',
  KerberosTip: 'Вход с правами пользователя, который вошол в операционную систему. Компьютер должен быть в домене',

  OpenIDHeader: 'Login using external authorization service',
  OpenidTip: 'Login using external authorization service. After clicking "enter", enter authorization data in the authorization window.',
  OpenIDConnect: 'OpenID',
  authOpenIDConnectFail: "Provider can't authorize your request",

  Authentication: 'Аутентификация',
  RegistrationMode: 'Режим регистрации',
  AdditionalLoginOptions: 'Дополнительные параметры входа',
  useOSCredentialTitle: 'Доменная',
  useUBAuthenticationTitle: 'По паролю',
  useCertificateTitle: 'По ключу',
  useCertificateInfo: 'Вход с использованием <b>личного ключа:</b><ol>' +
  '<li>Установите носитель ключевой информации</li>' +
  '<li>Введите имя пользователя и пароль</li>' +
  '<li>Нажмите "Вход"</li>' +
  '<li>В диалоговом окне выберите месторасположение ключа, <br>укажите пароль и нажмите "Ок"</li></ol>',
  useCertificateInfoSimple: 'Вход с использованием <b>личного ключа:</b><ol>' +
   '<li>Установите носитель ключевой информации</li>' +
    '<li>Выберите месторасположение ключа и укажите пароль к ключу</li>' +
    '<li>Нажмите "Войти"</li></ol>',
  useCertificateInfoSimpleUserName: 'Вход с использованием <b>личного ключа:</b><ol>' +
  '<li>Установите носитель ключевой информации</li>' +
  '<li>Введите имя пользователя</li>' +
  '<li>Нажмите "Войти"</li>' +
  '<li>В диалоговом окне выберите месторасположение ключа, <br>укажите пароль и нажмите "Ок"</li></ol>',
  IITCertCanceledByUser: 'Считывание ключа отменено пользователем',
  msgInvalidPlugin: 'Версия плагина устарела. Установлена версия {0}, требуется {1}. Автоматическое обновление происходит раз в 2 часа.' +
  ' Для ручного запуска воспользуйтесь <a href="models/adminui-pub/ub-extension/pluginUpdateInstruction_ru.html" target="_blank">инструкцией</a>. ' +
  ' Если после обновления сообщение осталось, обратитесь к администратору.',
  keyDeviseType: 'Тип носителя',
  keyFile: 'Личный ключ',
  keyDevise: 'Название носителя',
  'Selected certificate': 'Выбранный сертификат',
  'Select certificate file': 'Выберите файлы сертификатов',
  'Load certificates': 'К сожалению, не удалось найти сертификат. Выберите и загрузите ваш сертификат, который соответствует личному ключу.',
  'Load': 'Загрузить',
  'Cancel': 'Отменить',
  'ByKeyFile': 'Файл',

  unknownError: 'Возникла неизвестная ошибка. Обратитесь, пожалуйста, к администратору системы.',
  recordNotExistsOrDontHaveRights: 'Запись не существует или у Вас отсутствуют права доступа',
  msgInvalidCertAuth: 'В доступе отказано. Некорректный сертификат, закрытый ключ или ошибочное имя пользователя.',
  msgInvalidUBAuth: 'В доступе отказано. Проверьте имя пользователя и пароль.',
  ubErrElsInvalidUserOrPwd: 'В доступе отказано. Проверьте имя пользователя и пароль.',

  'Access deny': 'У Вас отсутствуют права на выполнение этой операции',
  ERR_REFERENCE_ERROR: 'Невозможно выполнить операцию - элемент используется в других сущностях',
  VALUE_MUST_BE_UNIQUE: 'Нарушена уникальность - указанное значение уже используется в других записях',
  SelectPKAndPassMsg: 'Виберите файл и заполните пароль',
  ReadPkTitle: 'Считывание личного ключа',
  'Select private key file': 'Виберіть файл приватного ключа',
  'Selected key file': 'Выбрано файл ключа',
  selectSigningCertificate: 'Выберите файл с сертификатом для подписи',
  certificate: 'Сертификат',
  certificates: 'Сертификаты',
  'UacException BAD_PASSWORD : 1016': 'Неверный пароль или ключ повредежден',
  'uac_certStatusError': 'Невозможно определить статус сертификата',
  'uac_certificateRevoked': 'Сертификат был отозван центром сертификации. Возможно завершился срок действия ключа',
  MAX_TREEPATH_DEPTH_EXCEED: 'Нельзя подчинить элемент данному родителю - это приведет к зацикливанию',
  'Request Entity Too Large': 'Объем данных который Вы пытаетесь загрузить на сервер превышает установленный лимит. Действие отменено',

  EnterNewPassword: 'Введите новый пароль',
  Change: 'Изменить',
  NewPassword: 'Новый пароль',
  RetypePassword: 'Пароль повторно',
  HowToCreatePassword: 'Как выбрать надёжный пароль?',
  passwordRecommendation: '* пароль должен быть не короче 6 символов. <br > * пароль должен содержать числа <br > * пароль должен содержать большие и маленькие символы латинского алфавита  <br >пароль должен содержать спецсимволы: ! @ # $ % ^ & * ( ) _ - + : ; , . ',
  passwordsDoNotMatch: 'Пароли не совпадают',
  passwordChangedSuccessfully: 'Пароль успешно изменён. Необходимо выйти из приложения для вступления изменений в силу',
  EnterOldPassword: 'Введите текущий пароль',
  OldPassword: 'Текущий пароль',
  'Your password is expired. Please change password': 'Ваш пароль устарел. Для продолжения работы необходимо изменить пароль',
  'Incorrect old password': 'Неверный текущий пароль',
  'Password is too short': 'Пароль слишком короткий',
  'Password is too simple': 'Пароль не отвечает требованиям надежности',
  'Password is dictionary word': 'Пароль не может быть словом со словаря',
  'Password matches with login': 'Пароль не может совпадать с логином',
  'Previous password is not allowed': 'Пароль совпадает с одним из предыдущих',
  logout: 'Выход',
  fieldValidationError: 'Невозможно сохранить карточку <b>{0}</b>.<br > Неверно заполнено поле',
  blankText: 'Это поле обязательно для заполнения'

})
