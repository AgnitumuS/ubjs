/* global UB */
UB.i18nExtend({
  Yes: 'Yes',
  No: 'No',
  ok: 'Ok',
  cancel: 'Cancel',
  Enter: 'Enter',
  Password: 'Password',
  User: 'User name', // login
  UBAuthTip: "Please, enter the user name, password and click 'Enter'",
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
  AdditionalLoginOptions: 'Additional login options',
  useOSCredentialTitle: 'Domain',
  useUBAuthenticationTitle: 'User&password',
  useCertificateTitle: 'Using certificate',
  useCertificateInfo: 'Authorization using electronic signature',
  useCertificateInfoSimple: 'Authorization using electronic signature. Press "Continue" for key selection',
  useCertificateInfoSimpleUserName: 'Authorization using electronic signature',
  IITCertCanceledByUser: 'Canceled by user',
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
  'Selected certificate': 'Selected Certificate',
  'Select certificate file': 'Select certificate file',
  LoadCertificatesFails: 'Automatically certificates upload fails. Please, upload your certificate that matches the private key manually',
  LoadCertificatesFailsCASelect: 'To use a private key, a certificate is required. <br> <br> Please select the CA in which you received a private key and we will try to download the certificate automatically',
  'Load': 'Upload',
  'Cancel': 'Cancel',
  'ByKeyFile': 'File',
  'Use proxy server': 'Use proxy server',
  'Proxy host': 'Host',
  'Proxy port': 'Port',
  'Authenticate on proxy': 'Authenticate on proxy',
  'User name': 'User name',
  'Save password': 'Save password',
  'Save': 'Save',
  'Select CA': 'Select CA',
  'CA': 'CA',
  'Crypto library settings': 'Crypto library settings',

  unknownError: 'Unknown error. Please, contact your system administrator.',
  recordNotExistsOrDontHaveRights: 'Record not exists or you don\'t have access rights',
  msgInvalidCertAuth: 'Invalid certificate or private key',
  msgInvalidUBAuth: 'Access denied. Invalid user name or password',
  ubErrElsInvalidUserOrPwd: 'Access deny. Check login name and password.',
  UserWithoutOrgEmployeeNotAllowed: 'Login for user without corresponding employee on staff not allowed',

  'Access deny': 'You do not have rights to perform this operation',
  ERR_REFERENCE_ERROR: 'Unable to perform the operation - element is being used in other entities',
  VALUE_MUST_BE_UNIQUE: 'Unable to perform the operation - specified value must be unique, but is being used in other entities',
  SelectPKAndPassMsg: 'Select a file and fill out the password',
  ReadPkTitle: 'Reading a private key',
  readPKCanceled: 'Private key load canceled',
  'Select private key file': 'Select private key file',
  'Selected key file': 'Selected key file',
  selectSigningCertificate: 'Select certificate for signing',
  certificate: 'Certificate',
  certificates: 'Certificates',
  SignatureVerificationResultObj: {
    _: 'Signature(s) verification result',
    valid: {
      yes: 'Signature valid',
      no: 'Signature invalid',
      warnings: {
        annotations: 'Document contains annotations',
        signatureNotCoversWholeDocument: 'Signature do not covers whole document'
      }
    },
    tspValid: {
      yes: 'Time stamp verification',
      no: 'Time stamp NOT verified'
    },
    ocspVerified: {
      yes: 'Certificate validated',
      no: 'Certificate validation status is unknown'
    },
    hardwareKeyUsed: 'hardwareKeyUsed',
    signingTime: 'Signing time',
    signatureStatus: 'Signature status',
    signatureAuthor: 'Signer',
    certificate: {
      _: 'Certificate',
      keyUsage: 'Key usage',
      serial: 'Serial #',
      validFrom: 'Valid from',
      validTo: 'Valid until',
      issuedBy: {
        _: 'Issued by',
        orgName: 'Organization',
        fullName: 'Authority',
        country: 'Country',
        locality: 'Locality',
        issuerID: 'Issuer ID',
        orgUnit: 'Org. unit'
      },
      subject: {
        _: 'Subject',
        DRFO: 'DRFO',
        fullName: 'Full name',
        country: 'Country',
        locality: 'Locality',
        eMail: 'E-Mail',
        phone: 'Phone'
      },
      organization: {
        _: 'Organization',
        EDRPOU: 'EDRPOU',
        orgName: 'Name',
        position: 'Position',
        orgUnit: 'Department'
      }
    }
  },
  'UacException BAD_PASSWORD : 1016': 'Invalid password or key is broken',
  'uac_certStatusError': 'Certificate status is unknown',
  'uac_certificateRevoked': 'The certificate was abandoned by the certification authority or key is expire',
  MAX_TREEPATH_DEPTH_EXCEED: 'You can not subordinate an element to this parent - this will result in a loop',
  'Request Entity Too Large': 'The amount of data you are trying to upload to the server exceeds the limit. Operation aborted',

  EnterNewPassword: 'Enter new password',
  Change: 'Change',
  NewPassword: 'New password',
  RetypePassword: 'Retype password',
  HowToCreatePassword: 'How to create a good password?',
  passwordRecommendation: 'Password length should be 6-20 characters. <br > You can use digits, latin characters and symbols: <br >! @ # $ % ^ & * ( ) _ - + : ; , . ',
  passwordsDoNotMatch: 'Passwords do not match',
  passwordChangedSuccessfully: 'Password changed successfully. Please logout to use new password',

  EnterOldPassword: 'Enter the current password',
  OldPassword: 'Current password',
  'Your password is expired. Please change password': 'Your password is expired. To continue, you must change your password',
  'Incorrect old password': 'Incorrect current password',
  'Password is too short': 'New password is too short',
  'Password is too simple': 'New password is too simple',
  'Password is dictionary word': 'New password cannot be as word from dictionary',
  'Password matches with login': 'New password matches with login',
  'Previous password is not allowed': 'New password matches with one of the previous',
  logout: 'Logout',
  fieldValidationError: 'Cannot save <b>{0}</b> card.<br > Invalid field',
  blankText: 'This field is required'

})
