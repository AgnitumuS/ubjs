/* global UB */
UB.i18nExtend({
  Yes: 'Bəli',
  No: 'Xeyr',
  ok: 'ОK',
  cancel: 'Ləğv',
  Enter: 'Daxil ol',
  Password: 'Parol',
  User: 'İstifadəçi',
  UBAuthTip: 'İstifadəçi adı və şifrəni daxil edib “Daxil ol” düyməsini sıxın',
  UBAuthHeader: '{0} <br/> hesabınızla daxil olun',
  UBAuthForgotPassword: 'Şifrəni unutmusunuz',
  UBAuthRegistration: 'Qeydiyyat',
  UBAuthContinue: 'Davam etmək',
  KerberosRemember: 'Bu üsulu xatırlayın',
  KerberosRememberUserMenu: 'Domen üzrə daxil olmaq',
  KerberosHeader: 'Əməliyyat sistemi hesabından <br/> istifadə edərək daxil olun',
  KerberosTip: 'Əməliyyat sisteminin girişi zamanı göstərilən istifadəçi adı və paroldan istifadə etməklə giriş.Kompüter domeninə qoşulmuş olmalıdır',

  OpenIDHeader: 'Login using external authorization service',
  OpenidTip: 'Login using external authorization service. After clicking "enter", enter authorization data in the authorization window.',
  OpenIDConnect: 'OpenID',
  authOpenIDConnectFail: "Provider can't authorize your request",

  Authentication: 'Autentikasiya',
  RegistrationMode: 'Qeydiyyat rejimi',
  AdditionalLoginOptions: 'Əlavə giriş variantları',
  useOSCredentialTitle: 'Domen',
  useUBAuthenticationTitle: 'Parol üzrə',
  useCertificateTitle: 'Açar üzrə',
  useCertificateInfo: '<b>şəxsi açardan istifadə etməklə giiriş:</b><ol>' +
  '</li> Yoxlama qurğusuna açar məlumatın daşıyıcısını <li> quraşdırın ' +
  '"Daxil ol"</li> sıxın<li>' +
  '<li>Dialoq pəncərəsində açarın yerləşmə yerini seçin,<br> parol göstərin və "ОK" sıxın</li></ol>',
  useCertificateInfoSimple: '<b>şəxsi açardan istifadə etməklə giiriş:</b><ol>' +
  '</li> Yoxlama qurğusuna açar məlumatın daşıyıcısını <li> quraşdırın ' +
  '"Daxil ol"</li> sıxın<li>' +
  '<li>Dialoq pəncərəsində açarın yerləşmə yerini seçin,<br> parol göstərin və "ОK" sıxın</li></ol>',
  useCertificateInfoSimpleUserName: '<b>şəxsi açardan istifadə etməklə giiriş:</b><ol>' +
  '</li> Yoxlama qurğusuna açar məlumatın daşıyıcısını <li> quraşdırın ' +
  '"Daxil ol"</li> sıxın<li>' +
  '<li>Dialoq pəncərəsində açarın yerləşmə yerini seçin,<br> parol göstərin və "ОK" sıxın</li></ol>',
  keyDeviseType: 'Daşıyıcı tipi',
  keyFile: 'Şəxsi açar',
  keyDevise: 'Daşıyıcının adı',
  'Selected certificate': 'Seçilmiş sertifikat',
  'Select certificate file': 'Sertifikat faylları seçin',
  LoadCertificatesFails: 'Təəssüf ki, sertifikatı tapmaq mümkün olmadı. Zəhmət olmasa sizin şəxsi açarınıza uyğun olan sertifikatı seçib yükləyin.',
  'Load': 'Yükləmək',
  'Cancel': 'Ləğv etmək',
  'ByKeyFile': 'Fayl',

  IITCertCanceledByUser: 'Canceled by user',
  msgInvalidPlugin: 'Plaginin versiyası köhnəlib. Quraşdırılmış versiya {0}, tələb olnur {1}. Avtomatik yenilənmə 2 saatdan bir baş verir.' +
  ' Əllə iş salmaq üçün bu instruksiyadan <a href="models/adminui-pub/ub-extension/pluginUpdateInstruction_az.html" target="_blank">istifadə edin</a>. ' +
  ' Əgər yenilənmədən sonra mesaj yenədə qalıbsa, administratorun köməyindən istifadə edin.',

  unknownError: 'Naməlum səhv baş vermişdir. Xahiş edirik, administratora müraciət edəsiniz.',
  recordNotExistsOrDontHaveRights: 'Qeyd mövcud deyil, yaxud Sizin ona baxmaq üçün hüququnuz yoxdur',
  msgInvalidCertAuth: 'Girişə icazə verilmədi. Yanlış sertifikat, yaxud bağlı açar.',
  msgInvalidUBAuth: 'Keçid ləğv olunub. Zəhmət olmasa istifadəçi adı və parol -u yoxlayın.',
  ubErrElsInvalidUserOrPwd: 'Keçid ləğv olunub. Zəhmət olmasa istifadəçi adı və parol -u yoxlayın.',

  'Access deny': 'Bu əməliyyat yerinə yetirmək üçün hüquqları yoxdur',
  ERR_REFERENCE_ERROR: 'əməliyyat bilmir - element digər şəxslərin istifadə olunur',
  VALUE_MUST_BE_UNIQUE: 'əməliyyat yerinə yetirmək üçün bilmir - unikal olmalıdır müəyyən dəyər, lakin digər şəxslərin istifadə olunur',
  SelectPKAndPassMsg: 'Faylı seçin və şifrəni əlavə edin',
  ReadPkTitle: 'Şəxsi açarın oxunması',
  'Select private key file': 'Şəxsi açarın faylını seçin',
  'Selected key file': 'Seçilmiş açar faylı',
  selectSigningCertificate: 'İmza üçün sertifikat faylını seçin',
  certificate: 'Sertifikat',
  certificates: 'Sertifikatlar',
  MAX_TREEPATH_DEPTH_EXCEED: 'Bir elementi bu valideynə bağlamaq (tabe etmək) olmaz - bu dövriyyələnməyə səbəb olacaq',
  'Request Entity Too Large': 'Serverə yükləməyə çalışdığınız məlumatların həcmi artıqdır',

  EnterNewPassword: 'Yeni şifrəni daxil edin',
  Change: 'Dəyişdirmək',
  NewPassword: 'Yeni parol',
  RetypePassword: 'Parol təkrarən',
  HowToCreatePassword: 'Etibarlı parolu necə seçməli?',
  passwordRecommendation: '* Parol 6 simvoldan qısa olmalıdır. <br > * parol rəqəmlərdən ibarət olmalıdır  <br > * parol latın əlifbasının böyük və kiçik simvollardan ibarət olmalıdır <br >parol xüsusi simvollardan ibarət olmalıdır: ! @ # $ % ^ & * ( ) _ - + : ; , . ',
  passwordsDoNotMatch: 'Parollar üst-üstə düşmür',
  passwordChangedSuccessfully: 'Parol uğurla dəyişdirildi',

  EnterOldPassword: 'Cari şifrəni daxil edin',
  OldPassword: 'Cari şifrə',
  'Your password is expired. Please change password': 'Sizin şifrəniz köhnəlmişdir. İşi davam etdirmək üçün şifrəni dəyişmək lazımdır',
  'Incorrect old password': 'Yanlış şifrə',
  'Password is too short': 'Şifrə çox qısadır',
  'Password is too simple': 'Şifrə etibarlılıq tələblərinə cavab vermir',
  'Password is dictionary word': 'Şifrə lüğətdəki söz ola bilməz',
  'Password matches with login': 'Şifrə loginlə eyni ola bilməz',
  'Previous password is not allowed': 'Şifrə əvvəlkilərdən biri ilə eynidir',
  logout: 'Çıxış',
  fieldValidationError: '<b>{0}</b>.<br > kartını yadda saxlamaq mümkün deyil. Yanlış doldurulmuş xana',
  blankText: 'Bu xana mütləq doldurulmalıdır'

})
