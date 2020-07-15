/* global UB */
UB.i18nExtend({
  Yes: 'Да',
  No: 'Нет',
  ok: 'ОК',
  cancel: 'Отмена',
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

  OpenIDHeader: 'Вход через сервис авторизации',
  OpenidTip: 'Вход через внешний сервис авторизации. После нажатия "войти", введите данные в окне автризации',
  OpenIDConnect: 'OpenID',
  authOpenIDConnectFail: 'Удостоверяющий центр отклонил запрос на аутентификацию',

  Authentication: 'Аутентификация',
  RegistrationMode: 'Режим регистрации',
  AdditionalLoginOptions: 'Дополнительные параметры входа',
  useOSCredentialTitle: 'Доменная',
  useUBAuthenticationTitle: 'По паролю',
  useCertificateTitle: 'По ключу',
  useCertificateInfo: 'Вход с использованием <b>личного ключа ЭП:</b><ol>' +
  '<li>Установите носитель ключевой информации</li>' +
  '<li>Введите имя пользователя и пароль</li>' +
  '<li>Нажмите "Продолжить"</li>' +
  '<li>В диалоговом окне выберите месторасположение ключа, <br>укажите пароль и нажмите "Загрузить"</li></ol>',
  useCertificateInfoSimple: 'Вход с использованием <b>личного ключа ЭП:</b><ol>' +
   '<li>Установите носитель ключевой информации</li>' +
    '<li>Нажмите "Продолжить"</li>' +
    '<li>В диалоговом окне выберите месторасположение ключа, <br>укажите пароль и нажмите "Загрузить"</li></ol>',
  useCertificateInfoSimpleUserName: 'Вход с использованием <b>личного ключа:</b><ol>' +
  '<li>Установите носитель ключевой информации</li>' +
  '<li>Введите имя пользователя</li>' +
  '<li>Нажмите "Войти"</li>' +
  '<li>В диалоговом окне выберите месторасположение ключа, <br>укажите пароль и нажмите "Ок"</li></ol>',
  IITCertCanceledByUser: 'Считывание ключа отменено пользователем',
  msgInvalidPlugin: 'Версия плагина устарела. Установлена версия {0}, требуется {1}. Автоматическое обновление происходит раз в 2 часа.' +
  ' Для ручного запуска воспользуйтесь <a href="models/adminui-pub/ub-extension/pluginUpdateInstruction_ru.html" target="_blank">инструкцией</a>. ' +
  ' Если после обновления сообщение осталось, обратитесь к администратору.',

  registrationPassed: 'Ваш сертификат успешно загружен и передан на обработку',
  keyAlreadyRegisteredForUser: 'Сертификат уже зарегистрирован для другого сотрудника',
  keyBlockedByAdmin: 'Администратор заблокировал использование сертификата для входа в систему. Основание для блокировки: ',
  keyNoRightsRejected: 'Пользователь не имеет права на работу с системой. В заявке на регистрацию сертификата отказано.',
  keyNoRightsRepeat: 'Пользователь не имеет права на работу с системой. Заявка на повторную регистрацию сертификата находится в состоянии рассмотрения.',
  keyAlreadyRegistered: 'Невозможно отправить заявку на регистрацию сертификата. Данный сертификат уже зарегистрирован в системе.',

  keyDeviseType: 'Тип устройства',
  keyFile: 'Личный ключ',
  keyDevise: 'Название устройства',
  'Selected certificate': 'Выбранный сертификат',
  'Select certificate file': 'Выберите файлы сертификатов',
  LoadCertificatesFails: 'Не удалось автоматически загрузить сертификат. <br><br>Самостоятельно выберите сертификат для Вашего личного ключа. <br><br>Если при получении ключа Вам не предоставили файлов с сертификатами - обратитесь в Ваш АЦСК для их получения',
  LoadCertificatesFailsCASelect: 'Для использования личного ключа необходим его сертификат. <br><br> Пожалуйста, выберите АЦСК в котором Вы получили личный ключ и мы попробуем загрузить сертификат автоматически',
  'Load': 'Загрузить',
  'Cancel': 'Отменить',
  'ByKeyFile': 'Файл',
  'Use proxy server': 'Подключаться через прокси сервер',
  'Proxy host': 'Сервер',
  'Proxy port': 'Порт',
  'Authenticate on proxy': 'Аутентифицировть на прокси сервере',
  'User name': 'Пользователь',
  'Save password': 'Сохранять пароль',
  'Save': 'Сохранить',
  'Select CA': 'Выберите АЦСК',
  'CA': 'АЦСК',
  'Crypto library settings': 'Параметры библиотеки подписания',

  unknownError: 'Возникла неизвестная ошибка. Обратитесь, пожалуйста, к администратору системы.',
  recordNotExistsOrDontHaveRights: 'Запись не существует или у Вас отсутствуют права доступа',
  msgInvalidCertAuth: 'В доступе отказано. Некорректный сертификат, закрытый ключ или ошибочное имя пользователя.',
  msgInvalidUBAuth: 'В доступе отказано. Проверьте имя пользователя и пароль.',
  ubErrElsInvalidUserOrPwd: 'В доступе отказано. Проверьте имя пользователя и пароль.',
  UserWithoutOrgEmployeeNotAllowed: 'Пользователь не состоит в штате организации (не сопоставлен со штатной единицей). Вход запрещён.',

  'Access deny': 'У Вас отсутствуют права на выполнение этой операции',
  ERR_REFERENCE_ERROR: 'Невозможно выполнить операцию - элемент используется в других сущностях',
  VALUE_MUST_BE_UNIQUE: 'Нарушена уникальность - указанное значение уже используется в других записях',
  SelectPKAndPassMsg: 'Виберите файл и заполните пароль',
  ReadPkTitle: 'Считывание личного ключа КЕП',
  readPKCanceled: 'Загрузка личного ключа отменена',
  'Select private key file': 'Выберите файл личного ключа',
  'Selected key file': 'Выбрано файл ключа',
  selectSigningCertificate: 'Выберите файл с сертификатом для подписи',
  certificate: 'Сертификат',
  certificates: 'Сертификаты',
  SignatureVerificationResultObj: {
    _: 'Результат проверки подписи(ей)',
    valid: {
      yes: 'Подпись проверена успешно, целостность данных подтверждена',
      no: 'Подпись не верна',
      warnings: {
        annotations: 'Документ содержит аннотации',
        signatureNotCoversWholeDocument: 'Подпись не покрывает весь документ'
      }
    },
    tspValid: {
      yes: 'Время подписи подтверждено квалифицированной меткой времени для подписи от Поставщика',
      no: 'Время подписи НЕ ПОДТВЕРЖДЕНО квалифицированной меткой времени'
    },
    ocspVerified: {
      yes: 'Сертификат для подписи был действителен на момент подписания',
      no: 'Не для длительного хранения (результат проверки сертификата на момент подписания не включен в подпись)'
    },
    hardwareKeyUsed: 'hardwareKeyUsed',
    signingTime: 'Время нанесения подписи',
    signatureStatus: 'Статус подписи',
    signatureAuthor: 'Подписант',
    certificate: {
      _: 'Сертификат',
      keyUsage: 'Назначение ключей',
      serial: 'Регистрационный номер',
      validFrom: 'Начало срока действия',
      validTo: 'Конец срока действия',
      issuedBy: {
        _: 'Видано',
        orgName: 'Организация',
        fullName: 'Центр сертификации',
        country: 'Страна',
        locality: 'Расположение',
        issuerID: 'РН центру сертификации',
        orgUnit: 'Департамент(подразделение)'
      },
      subject: {
        _: 'Владелец',
        DRFO: 'ДРФЛ',
        fullName: 'Наименование',
        country: 'Страна',
        locality: 'Расположение',
        eMail: 'E-Mail',
        phone: 'Телефон'
      },
      organization: {
        _: 'Организация(учреждение)',
        EDRPOU: 'ЄГРПОУ',
        orgName: 'Название',
        digitalStampName: 'Электронная печать',
        position: 'Должность подписанта',
        orgUnit: 'Департамент(подразделение)'
      }
    }
  },
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
  passwordRecommendation: 'Длина пароля должна быть {0}-20 символов.\n' +
    'Вы можете использовать цифры, латинские буквы и символы:' +
    ' ! @ # $ % ^ & * ( ) _ - + : ; , . ',
  passwordsDoNotMatch: 'Пароли не совпадают',
  passwordChangedSuccessfully: 'Пароль успешно изменён. Необходимо выйти из приложения для вступления изменений в силу',

  EnterOldPassword: 'Введите текущий пароль',
  OldPassword: 'Текущий пароль',
  'Your password is expired. Please change password': 'Ваш пароль устарел. Для продолжения работы необходимо изменить пароль',
  'Incorrect old password': 'Неверный текущий пароль',
  'Password is too short': 'Пароль слишком короткий',
  'Password is too simple': 'Пароль не отвечает требованиям надежности',
  'Password is dictionary word': 'Пароль не должен быть словом со словаря',
  'Password matches with login': 'Пароль не должен содержать в себе имя пользователя',
  'Previous password is not allowed': 'Пароль совпадает с одним из предыдущих',
  logout: 'Выход',
  fieldValidationError: 'Невозможно сохранить карточку <b>{0}</b>.<br > Неверно заполнено поле',
  blankText: 'Это поле обязательно для заполнения',
  licenseExceedText: 'Лицензионные ограничения приложения превышены. Вы можете просматривать данные, но большинство изменений не допускается'

})
