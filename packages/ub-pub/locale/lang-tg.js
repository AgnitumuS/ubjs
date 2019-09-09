/* global UB */
UB.i18nExtend({
  ok: 'ОК',
  cancel: 'Отмена',
  Yes: 'Ҳа',
  No: 'Не',
  Enter: 'Даромад',
  Password: 'Гузарвожа',
  User: 'Истифодабаранда', // login
  UBAuthTip: 'Номи истифодабарандаро, гузарвожаро ворид кунед ва тугмачаи "Даромад" -ро пахш кунед.', // useUBAuthenticatinInfo
  UBAuthHeader: 'Ба Утоқи шахсӣ худ <br/> {0} ворид шавед',
  UBAuthForgotPassword: 'Гузарвожаро фаромӯш кардаед?',
  UBAuthRegistration: 'Registration',
  UBAuthContinue: 'Идомадодан',
  KerberosRemember: 'Ин усули воридшавиро фаромӯш накунед',
  KerberosRememberUserMenu: 'Ҳамеша бо истифодаи домен ворид шавед',
  KerberosHeader: 'Вуруд бо истифода аз аккаунти <br/> системаи амалиетӣ', // useOSCredentialInfo
  KerberosTip: 'Воридшавӣ бо ҳуқуқи истифодабарандае, ки ба системаи амалиёти ворид шудааст. Компютер бояд ба домен дохил карда шавад',
  Authentication: 'Аттестатсия',
  RegistrationMode: 'Низоми бақайдгири',
  AdditionalLoginOptions: 'Вариантҳои иловагии вурудӣ',
  useOSCredentialTitle: 'Доменная',
  useUBAuthenticationTitle: 'Бо гузарвожа',
  useCertificateTitle: 'Бо калид',
  useCertificateInfo: 'Вуруд бо истифода бурдани <b> калиди шахсии:</b><ol>' +
  '<li>Насб кардани интиқолдиҳандаи асосии иттилоот</li>' +
  '<li>Номи истифодабарандаро ва гузарвожаро ворид кунед</li>' +
  '<li>Тугмачаи "Ворид" -ро пахш намоед</li>' +
  '<li>Дар равзанаи муколама, макони калидро интихоб кунед, <br>гузарвожаро ворид кунед ва тугмачаи "OK" -ро пахш кунед</li></ol>',
  useCertificateInfoSimple: 'Вуруд бо истифодаи <b>калиди шахси:</b><ol>' +
  '<li>Фиттаи иттилооти калидиро васл кунед</li>' +
  '<li>Тугмачаи "Ворид" -ро пахш намоед</li>' +
  '<li>Дар равзанаи муколама, макони калидро интихоб кунед, <br>гузарвожаро ворид кунед ва тугмачаи "OK" -ро пахш кунед</li></ol>',
  useCertificateInfoSimpleUserName: 'Вуруд бо истифодаи <b>калиди шахси:</b><ol>' +
  '<li>Насб кардани интиқолдиҳандаи маълумоти асосӣ</li>' +
  '<li>Номи истифодабарандаро ворид кунед</li>' +
  '<li>Тугмачаи "Ворид" -ро пахш кунед</li>' +
  '<li>Дар равзанаи муколама, макони калидро интихоб кунед, <br>гузарвожаро ворид кунед ва тугмачаи "OK" -ро пахш кунед</li></ol>',
  IITCertCanceledByUser: 'Хониши калидиро корбар бекор кардааст',
  msgInvalidPlugin: 'Нусхаи плагин кухна шудааст. Установлена версия {0}, требуется {1}. Навсозии автомати 1 бор дар 2 соат  ба амал меояд.' +
  ' Барои оғози дастӣ бо дастурамал <a href="models/adminui-pub/ub-extension/pluginUpdateInstruction_ru.html" target="_blank">истифода баред</a>. ' +
  ' Агар пас аз навсозӣ паём боқӣ монад, муроҷиат кунед ба маъмур.',

  unknownError: 'Хатогии номаълум рух додааст. Лутфан бо мудири системаи худ тамос гиред.',
  recordNotExistsOrDontHaveRights: 'Маълумот вуҷуд надорад ё шумо ҳуқуқи дастрасӣ надоред',
  msgInvalidCertAuth: 'Дастрасӣ манъ аст. Шаҳодатномаи беэътибор, калиди хусусӣ ё нодуруст номи истифодабаранда.',
  msgInvalidUBAuth: 'Дастрасӣ манъ аст. Номи истифодабарандаро ва гузарвожаро тасдиқ кунед.',
  ubErrElsInvalidUserOrPwd: 'Дастрасӣ манъ аст. Номи истифодабарандаро ва гузарвожаро тасдиқ кунед.',

  'Access deny': 'Шумо барои иҷрои ин амал иҷозат надоред',
  ERR_REFERENCE_ERROR: 'Иҷрои амалиет имконнопазир аст - унсури истифода бурда мешавад дар дигар сабтҳо',
  VALUE_MUST_BE_UNIQUE: 'Ягонагӣ вайрон карда шуд - арзиши нишондодашуда аллакай дар дигар сабтҳо истифода мешавад',
  SelectPKAndPassMsg: 'Файлро интихоб кунед ва рамзро пур кунед',
  ReadPkTitle: 'Считывание личного ключа',
  'Select private key file': 'Интихоб кардани калиди хусуси',
  'Selected key file': 'Файли калиди интихобшуда',
  selectSigningCertificate: 'Интихоб кунед файлро бо сертификат барои имзо',
  certificate: 'Сертификат',
  certificates: 'Сертификатҳо',
  MAX_TREEPATH_DEPTH_EXCEED: 'Шумо як унсурро ба ин волид тобеъ карда наметавонед  - это приведет к зацикливанию',
  'Request Entity Too Large': 'Миқдори иттилооте, ки шумо ба сервер бор кардан мехоҳед, аз маҳдудияти муқарраршуда зиёд аст',

  EnterNewPassword: 'Гузарвожаи навро ворид кунед',
  Change: 'Ивваз карданд',
  NewPassword: 'Гузарвожаи нав',
  RetypePassword: 'Гузарвожаро такроран ворид кунед',
  HowToCreatePassword: 'Гузарвожаи боэътимодро чӣ тавр бояд интихоб кард?',
  passwordRecommendation: '* Гузарвожа должен быть не короче 6 символов. <br > * Гузарвожа бояд рақамҳоро дар бар гирад <br > * Гузарвожарамз бояд аломатҳои лотинии калон ва хурд дошта бошад  <br >Гузарвожа бояд аломатҳои махсус дошта бошад: ! @ # $ % ^ & * ( ) _ - + : ; , . ',
  passwordsDoNotMatch: 'Гузарвожаҳо мувофиқ нестанд',
  passwordChangedSuccessfully: 'Гузарвожа бомуваффақият ивваз карда шуд. Барои ворид намудани тағирот шумо бояд аз приложения бароед.',
  EnterOldPassword: 'Гузарвожаи ҷориро ворид кунед',
  OldPassword: 'Гузарвожаи ҳозира',
  'Your password is expired. Please change password': 'Мӯҳлати гузарвожаи шумо гузаштааст. Барои идомаи кор, шумо бояд гузарвожаро ивваз кунед',
  'Incorrect old password': 'Гузарвожаи ҷорӣ хато аст',
  'Password is too short': 'Гузарвожа хеле кӯтоҳ аст',
  'Password is too simple': 'Гузарвожа ба талаботи амният ҷавоб намедиҳад',
  'Password is dictionary word': 'Гузарвожа наметавонад калимаи луғатӣ бошад',
  'Password matches with login': 'Гузарвожа  бо логин мувофиқат карда наметавонад',
  'Previous password is not allowed': 'Гузарвожа яке аз аввалинҳост.',
  logout: 'Баромадан',
  fieldValidationError: 'Кортро захира кардан ғайриимкон аст<b>{0}</b>.<br > Маълумот номувофиқ',
  blankText: 'Ин ҳавза ҳатмист барои пур кардани'

})
