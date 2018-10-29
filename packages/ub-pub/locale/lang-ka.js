/* global UB */
UB.i18nExtend({
  Enter: 'Enter',
  Password: 'Password',
  User: 'User name', // login
  UBAuthTip: "Please, enter the user name, password and click 'Enter'",
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
  useCertificateInfoSimple: 'Authorization using electronic signature. Select Key, input password and press "Enter"',
  useCertificateInfoSimpleUserName: 'Authorization using electronic signature',
  IITCertCanceledByUser: 'Canceled by user',
  msgInvalidPlugin: 'Plugin version is out of date. You have version {0}, but version {1} is required. Automatically update occurs every 2 hours.' +
  ' For manual updating use <a href="update_plugin.html" target="_blank">instruction</a>. ' +
  ' If after updating message remains, please, contact your system administrator.',

  unknownError: 'Unknown error. Please, contact your system administrator.',
  recordNotExistsOrDontHaveRights: 'Record not exists or you don\'t have access rights',
  msgInvalidCertAuth: 'Invalid certificate or private key',
  msgInvalidUBAuth: 'Access denied. Invalid user name or password',
  ubErrElsInvalidUserOrPwd: 'Access deny. Check login name and password.',

  'Access deny': 'You do not have rights to perform this operation',
  ERR_REFERENCE_ERROR: 'Unable to perform the operation - element is being used in other entities',
  VALUE_MUST_BE_UNIQUE: 'Unable to perform the operation - specified value must be unique, but is being used in other entities',
  SelectPKAndPassMsg: 'Select a file and fill out the password',
  ReadPkTitle: 'Reading a private key',
  'Select private key file': 'Select private key file',
  'Selected key file': 'Selected key file',
  selectSigningCertificate: 'Select certificate for signing',
  certificate: 'Certificate',
  certificates: 'Certificates',
  'UacException BAD_PASSWORD : 1016': 'Invalid password or key is broken',
  'uac_certStatusError': 'Certificate status is unknown',
  'uac_certificateRevoked': 'The certificate was abandoned by the certification authority or key is expire',
  MAX_TREEPATH_DEPTH_EXCEED: 'You can not subordinate an element to this parent - this will result in a loop',
  'Request Entity Too Large': 'Серверге жүктеп салғыңыз келетін деректердің саны шектен асады',

  EnterNewPassword: 'Enter new password',
  Change: 'Change',
  NewPassword: 'New password',
  RetypePassword: 'Retype password',
  HowToCreatePassword: 'How to create a good password?',
  passwordRecommendation: 'Password length should be 6-20 charaters. <br > You can use digits, latin characters and symbols: <br >! @ # $ % ^ & * ( ) _ - + : ; , . ',
  passwordsDoNotMatch: 'Passwords do not match',
  passwordChangedSuccessfully: 'Password changed successfully. Please logout to use new password',

  EnterOldPassword: 'Enter the current password',
  OldPassword: 'Current password',
  'Your password is expired. Please change password': 'Your password is expired. Please change password for continue working',
  'Incorrect old password': 'Incorrect current password',
  'Password is too short': 'Password is too short',
  'Password is too simple': 'Password is too simple',
  'Password is dictionary word': 'Password cannot be as word from dictionary',
  'Password matches with login': 'Password matches with login',
  'Previous password is not allowed': 'Password matches with one of the previous',
  logout: 'Logout',
  blankText: 'This is required field'

})
