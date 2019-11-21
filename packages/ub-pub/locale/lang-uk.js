/* global UB */
UB.i18nExtend({
  Yes: 'Так',
  No: 'Нi',
  ok: 'Ок',
  cancel: 'Відміна',
  Enter: 'Увійти',
  Password: 'Пароль',
  User: 'Користувач',
  UBAuthTip: "Введіть ім'я користувача, пароль та натисніть 'Увійти'",
  UBAuthHeader: 'Вхід через обліковий запис <br/> {0}',
  UBAuthForgotPassword: 'Забули пароль?',
  UBAuthRegistration: 'Реєстрація',
  UBAuthContinue: 'Продовжити',
  KerberosRemember: 'Запам\'ятати спосіб входу',
  KerberosRememberUserMenu: 'Завжди входити по домену',
  KerberosHeader: 'Вхід через обліковий запис <br/> операційної системи',
  KerberosTip: 'Вхід з правами користувача, що увійшов до операційної системи. Комп\'ютер повинен бути включено до домену',
  Authentication: 'Аутентифікація',
  RegistrationMode: 'Режим реєстрації',
  AdditionalLoginOptions: 'Додаткові параметри входу',
  useOSCredentialTitle: 'Доменна',
  useUBAuthenticationTitle: 'По паролю',
  useCertificateTitle: 'По ключу',
  useCertificateInfo: 'Вхід з використанням <b>особистого ключа КЕП:</b><ol>' +
  '<li>Встановіть носій ключової інформації</li>' +
  "<li>Введіть ім'я користувача та пароль</li>" +
  '<li>Натисніть "Увійти"</li>' +
  '<li>У діалоговому вікні оберіть розташування ключа, <br>вкажіть пароль захисту ключа та натисніть "Ок"</li>' +
  '</ol>',
  useCertificateInfoSimple: 'Вхід з використанням <b>особистого ключа КЕП:</b><ol>' +
    '<li>Встановіть носій ключової інформації</li>' +
    '<li>Оберіть розташування ключа та вкажіть пароль захисту ключа</li>' +
    '<li>Натисніть "Увійти"</li></ol>',
  useCertificateInfoSimpleUserName: 'Вхід з використанням <b>особистого ключа КЕП:</b><ol>' +
  '<li>Встановіть носій ключової інформації</li>' +
  "<li>Введіть ім'я користувача</li>" +
  '<li>Натисніть "Увійти"</li>' +
  '<li>У діалоговому вікні оберіть розташування ключа, <br>вкажіть пароль захисту ключа та натисніть "Ок"</li></ol>',
  IITCertCanceledByUser: 'Зчитування ключа відмінено користувачем',
  keyDeviseType: 'Тип носія',
  keyFile: 'Особистий ключ',
  keyDevise: 'Назва носія',
  'Selected certificate': 'Обраний сертифікат',
  'Select certificate file': 'Виберіть файли сертифікатів',
  'Load certificates': 'На жаль не вдалось знайти сертифікат. Оберіть та завантажте ваш сертифікат, який відповідає особистому ключу.',
  'Load': 'Завантажити',
  'Cancel': 'Відмінити',
  'ByKeyFile': 'Файл',
  'Use proxy server': 'Підключатися через проксі серервер',
  'Proxy host': 'Сервер',
  'Proxy port': 'Порт',
  'Authenticate on proxy': 'Автентикуватись на проксі сервері',
  'User name': 'Користувач',
  'Save password': 'Зберігати пароль',
  'Save': 'Зберегти',
  'Select acsk': 'Виберіть АЦСК',
  'acsk': 'АЦСК',
  'Crypto library settings': 'Параметри бібліотеки підпису',

  msgInvalidPlugin: 'Версія плагіна застаріла. Встановлено версію {0}, необхідно {1}. Автоматичне оновлення відбувається раз на 2 години.' +
  ' Для ручного запуску скористайтеся <a href="models/adminui-pub/ub-extension/pluginUpdateInstruction_uk.html" target="_blank">інструкцією</a>. ' +
  ' Якщо після оновлення повідомлення залишилось, зверніться до адміністратора.',

  unknownError: 'Виникла невідома помилка. Зверніться, будь ласка, до адміністратора системи.',
  recordNotExistsOrDontHaveRights: 'Запису не існує або у Вас відсутні права доступу',
  msgInvalidCertAuth: "В доступі відмовлено. Некоректний сертифікат, закритий ключ або ім'я користувача.",
  msgInvalidUBAuth: "В доступі відмовлено. Перевірте ім'я користувача та пароль.",
  ubErrElsInvalidUserOrPwd: "В доступі відмовлено. Перевірте ім'я користувача та пароль",

  'Access deny': 'У Вас відсутні права на виконання цієї операції',
  ERR_REFERENCE_ERROR: 'Неможливо виконати операцію - елемент використовується іншими сутностями',
  VALUE_MUST_BE_UNIQUE: 'Порушена унікальність - вказане значення вже використовується іншими записами',
  SelectPKAndPassMsg: 'Виберіть файл та заповніть пароль',
  selectedFile: 'Обрано файл',
  ReadPkTitle: 'Зчитування приватного ключа',
  'Select private key file': 'Оберіть файл особистого ключа',
  'Selected key file': 'Обрано файл ключа',
  selectSigningCertificate: 'Оберіть файл з сертифікатом, призначеним для підпису',
  certificate: 'Сертифікат',
  certificates: 'Сертифікати',
  'UacException BAD_PASSWORD : 1016': 'Невірний пароль або ключ пошкоджено',
  'uac_certStatusError': 'Неможливо визначити статус сертифікату',
  'uac_certificateRevoked': 'Сертифікат було відкликано центром сертифікації. Можливо закінчився термін дії ключа',
  MAX_TREEPATH_DEPTH_EXCEED: 'Неможливо так підпорядкувати елемент оскільки це приводить до циклу',
  'Request Entity Too Large': 'Обсяг даних який Ви намагаєтеся завантажити на сервер перевищує встановлений ліміт. Дію відмінено',

  EnterNewPassword: 'Задайте новий пароль',
  Change: 'Змінити',
  NewPassword: 'Новий пароль',
  RetypePassword: 'Пароль повторно',
  HowToCreatePassword: 'Як вибрати надійний пароль?',
  passwordRecommendation: '* пароль має містити не менше ніж 6 символів . <br > * пароль має містити числа <br > * пароль має містити великі та маленькі символи латинського алфавіту  <br >пароль має містити спецсимволи: ! @ # $ % ^ & * ( ) _ - + : ; , . ',
  passwordsDoNotMatch: 'Паролі не співпадають',
  passwordChangedSuccessfully: 'Пароль змінено вдало. Для використання нових параметрів необхідно вийти з додатку',
  EnterOldPassword: 'Вкажіть поточний пароль',
  OldPassword: 'Поточний пароль',
  'Your password is expired. Please change password': 'Ваш пароль є застарілим. Для продовження роботи потрібно змінити пароль',
  'Incorrect old password': 'Поточний пароль вказано неправильно',
  'Password is too short': 'Пароль занадто короткий',
  'Password is too simple': 'Пароль не відповідає критеріям надійності',
  'Password is dictionary word': 'Пароль не може бути словом із словника',
  'Password matches with login': 'Пароль не може співпадати з логіном',
  'Previous password is not allowed': 'Пароль співпадає з одним із попередніх',
  logout: 'Вихід',
  fieldValidationError: 'Неможливо зберегти картку <b>{0}</b>.<br > Невірно заповнено поле ',
  blankText: 'Це поле є обов’язковим для заповнення'

})
