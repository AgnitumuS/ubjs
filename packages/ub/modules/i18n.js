/*
 * Server side i18n
 */
const _ = require('lodash')
/**
 * i18n localization data. Do not use directly - use UB.i18n method instead
 * @property {Object} i18nData
 * @private
*/
let i18nData = {}

_.merge(i18nData, {
  'en': {
    'property': 'property',
    'inTime': 'In time',
    'notInTime': 'Not in time',
    'notExecuted': 'Not executed',
    'overdue': 'Overdue',
    'woTerm': 'Without term',
    'Model': 'Model',
    'Attribute': 'Attribute',
    'Type': 'Type',
    'Caption': 'Caption',
    'Description': 'Description',
    eof: ''
  },

  'ru': {
    'property': 'свойство',
    'inTime': 'Вовремя',
    'notInTime': 'Не вовремя',
    'notExecuted': 'Не выполнены',
    'overdue': 'Просрочены',
    'woTerm': 'Без срока',
    'Model': 'Модель',
    'Attribute': 'Атрибут',
    'Type': 'Тип',
    'Caption': 'Заголовок',
    'Description': 'Описание',
    eof: ''
  },

  'uk': {
    'property': 'властивість',
    'inTime': 'Вчасно',
    'notInTime': 'Не вчасно',
    'notExecuted': 'Не виконані',
    'overdue': 'Прострочені',
    'woTerm': 'Без срока',
    'Model': 'Модель',
    'Attribute': 'Атрибут',
    'Type': 'Тип',
    'Caption': 'Заголовок',
    'Description': 'Опис',
    eof: ''
  },

  'az': {
    'property': 'əmlak',

    'Model': 'Model',
    'Attribute': 'Attribute',
    'Type': 'Type',
    'Caption': 'Caption',
    'Description': 'Description',
    eof: ''
  }
})

_.merge(global.i18nData, {
  'en': {
    // M2Mobile
    projForSign: 'Projects for sign',
    projForVisa: 'Projects for visa',
    forConsideration: 'For consideration',
    presidentAssignment: 'President Assignments',
    caNoTerm: 'Without term',
    caToday: 'Today',
    ca3Days: 'Term 3 days',
    ca5Days: 'Term 5 days',
    caOverdue3Days: '3 days',
    caOverdue1Week: 'Week',
    caOverdue1Month: 'Month',
    caOverdue3Month: '3 months',
    caOverdue6Month: '6 months',
    caOverdueOver6Month: 'Over 6 months',
    caOverdue: 'Overdue',
    caExecuted: 'Executed',
    controlAssignment: 'Control personal assignments',
    personalAssignment: 'Personal assignments',

    identifier: 'Identifier',
    status: 'Status',
    regInfo: 'Registration info',
    docInfo: 'Document info',
    deadline: 'Deadline',
    toDocument: 'To document',
    executors: 'Executors',
    resolution: 'Resolution',
    myResolution: 'Executors of my resolution',
    docVersion: 'Document version',
    shortText: 'Short text',
    route: 'Route',
    toShortText: 'To document\'s short text',
    mainUnit: 'Responsible executor',

    signAction: 'Sign',
    signActionAlertText: 'Do you really want to sign this document?',
    signActionCommentText: 'Signed by iPad',
    visaAction: 'Visa',
    visaActionAlertText: 'Do you really want to visa this document?',
    visaActionCommentText: 'Vised by iPad',
    cancelAction: 'Revoke',
    cancelActionAlertText: 'Do you really want to revoke this document??',
    testAction: 'Test',
    signed: 'Signed',
    ot: ' of ',
    mainExecutor: 'Main executor',
    mainExecutors: 'Main executors',
    coExecutor: 'Coexecutor',
    coExecutors: 'Coexecutors',
    forInfo: 'For info',
    controller: 'Controller',
    controllers: 'Controllers',
    correspondent: 'Correspondent',
    individualControl: 'Individual control',
    controlLevel: 'Control level',
    resolution2: 'Resolution',
    urgent: 'Urgent',
    kind: 'Kind',
    theme: 'Theme',
    executionDate: 'Execution date',
    author: 'Author',
    version: 'Version',
    recRoute: 'Reconsilation route',
    signer: 'Signer',
    signers: 'Signers',
    visor: 'Visor',
    visors: 'Visors',
    rejectAction: 'Reject',
    rejectActionAlertText: 'Do you really want to reject this document?',
    rejectActionCommentText: 'Rejected by iPad',

    eof: ''
  },

  'ru': {
    eof: ''
  },

  'uk': {
    // M2Mobile
    projForSign: 'Проекти на підпис',
    projForVisa: 'Проекти на візування',
    forConsideration: 'Документи для розгляду',
    presidentAssignment: 'Доручення Президента',
    caNoTerm: 'Термін не надійшов',
    caToday: 'Сьогодні',
    ca3Days: 'Термін 3 дні',
    ca5Days: 'Термін 5 днів',
    caOverdue3Days: 'На 3 дні',
    caOverdue1Week: 'На тиждень',
    caOverdue1Month: 'На місяць',
    caOverdue3Month: 'На 3 місяці',
    caOverdue6Month: 'На 6 місяців',
    caOverdueOver6Month: 'Більше 6 місяців',
    caOverdue: 'Прострочені',
    caExecuted: 'Виконані',
    controlAssignment: 'Контроль особистих доручень',
    personalAssignment: 'Особисті доручення',

    identifier: 'Ідентифікатор',
    status: 'Статус',
    regInfo: 'Реєстраційні дані',
    docInfo: 'Інформація про документ',
    deadline: 'Термін виконання',
    toDocument: 'До документа',
    executors: 'Виконавці',
    resolution: 'Резолюція керівника',
    myResolution: 'Виконавці власної резолюції',
    docVersion: 'Версія документа',
    shortText: 'Короткий зміст',
    route: 'Маршрут',
    toShortText: 'Зміст "До документа"',
    mainUnit: 'Відповідальний виконавець',

    signAction: 'Підписати',
    signActionAlertText: 'Ви дійсно бажаєте підписати цей документ?',
    signActionCommentText: 'Підписано за допомогою iPad',
    visaAction: 'Завізувати',
    visaActionAlertText: 'Ви дійсно бажаєте завізувати цей документ?',
    visaActionCommentText: 'Завізовано за допомогою iPad',
    cancelAction: 'Відізвати',
    cancelActionAlertText: 'Ви дійсно бажаєте відізвати цей документ?',
    testAction: 'Тест',
    signed: 'Підписано',
    ot: ' від ',
    mainExecutor: 'Головний виконавець',
    mainExecutors: 'Головні виконавці',
    coExecutor: 'Співвиконавець',
    coExecutors: 'Співвиконавці',
    forInfo: 'До відома',
    controller: 'Контролер',
    controllers: 'Контролери',
    correspondent: 'Кореспондент',
    individualControl: 'Особливий контроль',
    controlLevel: 'Рівень контролю',
    resolution2: 'Резолюція',
    urgent: 'Терміново',
    kind: 'Вид',
    theme: 'Питання',
    executionDate: 'Дата виконання',
    author: 'Автор',
    version: 'Версія',
    recRoute: 'Маршрут узгодження',
    signer: 'Підписант',
    signers: 'Підписанти',
    visor: 'Візуючий',
    visors: 'Візуючі',
    rejectAction: 'Відхилити',
    rejectActionAlertText: 'Ви дійсно бажаєте відхилити цей документ?',
    rejectActionCommentText: 'Відхилено за допомогою iPad',

    eof: ''
  },

  'az': {
    'property': 'əmlak',

    eof: ''
  }
})

/**
 * @module i18n
 * @memberOf module:@unitybase/ub
 */
/**
 * Merge localizationObject to UB.i18n. Usually called form serverLocale scripts
 * @param {Object} localizationObject
 */
function extend (localizationObject) {
  _.merge(i18nData, localizationObject)
}

/**
 * Localize a message to lang. Return original message either lang not found
 * or msg mot found in lang
 * @param {String} lang
 * @param {*} msg
 * @return {*}
 */
function lookup (lang, msg) {
  if (!i18nData[lang]) return msg
  return i18nData[lang][msg] ? i18nData[lang][msg] : msg
}

module.exports = {
  lookup: lookup,
  extend: extend
}
