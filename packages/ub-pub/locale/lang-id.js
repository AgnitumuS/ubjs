/* global UB */
UB.i18nExtend({
  Yes: 'Yes',
  No: 'No',
  ok: 'Ok',
  cancel: 'Cancel',
  Enter: 'Enter',
  Password: 'Password',
  User: 'User name', // login
  UBAuthTip: "Please, enter the user name, password and click 'Enter'", // useUBAuthenticatinInfo
  UBAuthHeader: 'Sign in with your <br/> {0} account',
  UBAuthForgotPassword: 'Forgot password?',
  UBAuthRegistration: 'Registration',
  UBAuthContinue: 'Continue',
  KerberosRemember: 'Remember this login method',
  KerberosRememberUserMenu: 'Always log in using domain',
  KerberosHeader: 'Sign in using the <br/> operating system account', // useOSCredentialInfo
  KerberosTip: 'Login with the user rights entered into the operating system. The computer must be included in the domain',

  OpenIDHeader: 'Login using external authorization service',
  OpenidTip: 'Login using external authorization service. After clicking "enter", enter authorization data in the authorization window.',
  OpenIDConnect: 'OpenID',
  authOpenIDConnectFail: "Provider can't authorize your request",

  Authentication: 'Authentication',
  RegistrationMode: 'Registration mode',
  AdditionalLoginOptions: 'Opsi masuk tambahan',
  useOSCredentialTitle: 'Domain',
  useUBAuthenticationTitle: 'User&password',
  useCertificateTitle: 'Using certificate',
  useCertificateInfo: 'Authorization using electronic signature',
  useCertificateInfoSimple: 'Authorization using electronic signature',
  useCertificateInfoSimpleUserName: 'Authorization using electronic signature',
  IITCertCanceledByUser: 'Canceled by user',
  navShortcutCode: 'Shortcut source code',
  navShortcutRights: 'Shortcut rights',
  msgInvalidPlugin: 'Plugin version is out of date. You have version {0}, but version {1} is required. Automatically update occurs every 2 hours.' +
  ' For manual updating use <a href="update_plugin.html" target="_blank">instruction</a>. ' +
  ' If after updating message remains, please, contact your system administrator.',

  registrationPassed: 'Your certificate has been successfully uploaded and passed to the processing',
  keyAlreadyRegisteredForUser: 'Key is already registered for another user',
  keyBlockedByAdmin: 'Key for entering the system was blocked by system administrator. Blocking reason: ',
  keyNoRightsRejected: 'User cannot permissions to entering the system. Request for registration of key denied.',
  keyNoRightsRepeat: 'User do no have permissions to entering the system. Request for reminding registration of key in consideration state.',
  keyAlreadyRegistered: 'Unable to send request registration of key. Current key is already registered in system.',

  keyDeviseType: 'Device type',
  keyFile: 'Private key',
  keyDevise: 'Device name',
  'Selected certificate': 'Выбранный сертификат',
  'Select certificate file': 'Выберите файлы сертификатов',
  LoadCertificatesFails: 'LoadCertificatesFails',
  'Load': 'Загрузить',
  'Cancel': 'Отменить',
  'ByKeyFile': 'Файл',

  unknownError: 'Unknown error. Please, contact your system administrator.',
  recordNotExistsOrDontHaveRights: 'Record not exists or you don\'t have access rights',
  msgInvalidCertAuth: 'Invalid certificate or private key',
  msgInvalidUBAuth: 'Access denied. Invalid user name or password',
  ubErrElsInvalidUserOrPwd: 'Access deny. Check login name and password.',
  UserWithoutOrgEmployeeNotAllowed: 'Login for user without corresponding employee on staff not allowed',

  keyDeviseType: 'Тип носія',
  keyFile: 'Особистий ключ',
  keyDevise: 'Назва носія',

  'Access deny': 'Anda tidak memiliki hak untuk melakukan operasi ini',
  ERR_REFERENCE_ERROR: 'Tidak dapat melakukan operasi - elemen yang digunakan dalam entitas lainnya',
  VALUE_MUST_BE_UNIQUE: 'Tidak dapat melakukan operasi - nilai yang ditentukan harus unik, tapi sedang digunakan dalam entitas lainnya',
  SelectPKAndPassMsg: 'Select a file and fill out the password',
  ReadPkTitle: 'Зчитування приватного ключа',
  readPKCanceled: 'Private key load canceled',
  'Select private key file': 'Виберіть файл приватного ключа',
  'Selected key file': 'Selected key file',
  selectSigningCertificate: 'Select certificate for signing',
  certificate: 'Certificate',
  certificates: 'Certificates',
  MAX_TREEPATH_DEPTH_EXCEED: 'You can not subordinate an element to this parent - this will result in a loop',
  'Request Entity Too Large': 'The amount of data you are trying to upload to the server exceeds the limit',

  EnterNewPassword: 'Masukan kata sandi baru',
  Change: 'Perubahan',
  NewPassword: 'Kata sandi baru',
  RetypePassword: 'Ketik ulang kata sandi',
  HowToCreatePassword: 'Cara membuat password yang baik?',
  passwordRecommendation: 'Panjang password harus {0}-20 karakter.\n' +
    'Anda dapat menggunakan angka, charecters latin dan simbol-simbol: ' +
    '! @ # $% ^ & * () _ - +:; ,. ',
  passwordsDoNotMatch: 'Sandi tidak cocok',
  passwordChangedSuccessfully: 'Sandi berhasil diubah. Silakan logout untuk menggunakan password baru',

  EnterOldPassword: 'Введите текущий пароль',
  OldPassword: 'Текущий пароль',
  'Your password is expired. Please change password': 'Ваш пароль устарел. Для продолжения работы необходимо изменить пароль',
  'Incorrect old password': 'Неверный текущий пароль',
  'Password is too short': 'Пароль слишком короткий',
  'Password is too simple': 'Пароль не отвечает требованиям надежности',
  'Password is dictionary word': 'Пароль не может быть словом со словаря',
  'Password matches with login': 'Пароль не должен содержать в себе имя пользователя',
  'Previous password is not allowed': 'Пароль совпадает с одним из предидущих',
  logout: 'Logout',
  fieldValidationError: 'Can not save <b>{0}</b> card.<br > Invalid field',
  blankText: 'This is required field',
  licenseExceedText: 'Batas lisensi aplikasi terlampaui. Anda dapat melihat data tetapi sebagian besar modifikasi tidak diizinkan'

})
