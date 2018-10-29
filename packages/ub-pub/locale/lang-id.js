/* global UB */
UB.i18nExtend({
  Enter: 'Enter',
  Password: 'Password',
  User: 'User name', // login
  UBAuthTip: "Please, enter the user name, password and click 'Enter'", // useUBAuthenticatinInfo
  UBAuthHeader: 'Sign in with your <br/> {0} account',
  UBAuthForgotPassword: 'Forgot password?',
  UBAuthRegistration: 'Registration',
  UBAuthContinue: 'Continue',
  KerberosRemember: 'Remember this login method',
  KerberosRememberUserMenu: 'Always use domain for login',
  KerberosHeader: 'Sign in using the <br/> operating system account', // useOSCredentialInfo
  KerberosTip: 'Login with the user rights entered into the operating system. The computer must be included in the domain',
  Authentication: 'Authentication',
  RegistrationMode: 'Registration mode',
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

  unknownError: 'Unknown error. Please, contact your system administrator.',
  recordNotExistsOrDontHaveRights: 'Record not exists or you don\'t have access rights',
  msgInvalidCertAuth: 'Invalid certificate or private key',
  msgInvalidUBAuth: 'Access denied. Invalid user name or password',
  ubErrElsInvalidUserOrPwd: 'Access deny. Check login name and password.',

  'Access deny': 'Anda tidak memiliki hak untuk melakukan operasi ini',
  ERR_REFERENCE_ERROR: 'Tidak dapat melakukan operasi - elemen yang digunakan dalam entitas lainnya',
  VALUE_MUST_BE_UNIQUE: 'Tidak dapat melakukan operasi - nilai yang ditentukan harus unik, tapi sedang digunakan dalam entitas lainnya',
  SelectPKAndPassMsg: 'Select a file and fill out the password',
  ReadPkTitle: 'Зчитування приватного ключа',
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
  passwordRecommendation: 'Panjang password harus 6-20 karakter. <br> Anda dapat menggunakan angka, charecters latin dan simbol-simbol: <br>! @ # $% ^ & * () _ - +:; ,. ',
  passwordsDoNotMatch: 'Sandi tidak cocok',
  passwordChangedSuccessfully: 'Sandi berhasil diubah. Silakan logout untuk menggunakan password baru',

  EnterOldPassword: 'Введите текущий пароль',
  OldPassword: 'Текущий пароль',
  'Your password is expired. Please change password': 'Ваш пароль устарел. Для продолжения работы необходимо изменить пароль',
  'Incorrect old password': 'Неверный текущий пароль',
  'Password is too short': 'Пароль слишком короткий',
  'Password is too simple': 'Пароль не отвечает требованиям надежности',
  'Password is dictionary word': 'Пароль не может быть словом со словаря',
  'Password matches with login': 'Пароль не может совпадать с логином',
  'Previous password is not allowed': 'Пароль совпадает с одним из предидущих',
  logout: 'Logout',
  blankText: 'This is required field'

})
