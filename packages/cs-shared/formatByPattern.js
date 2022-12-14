/* global _defaultLang, _collator */
/**
 * Dates and Numbers formatting using Intl
 * On client this module exposed as `UB.formatter` and `Vue.prototype.$UB.formatter`
 *
 * - for available date format options see https://tc39.es/ecma402/#datetimeformat-objects
 * - for available number format options see https://tc39.es/ecma402/#numberformat-objects
 *
 * @module formatByPattern
 * @author xmax
 * @memberOf module:@unitybase/cs-shared
 */
// {month:  '2-digit', day: 'numeric', year: 'numeric',  hour: '2-digit', minute: '2-digit', second: '2-digit'})
const datePatterns = {
  date: { month: '2-digit', day: '2-digit', year: 'numeric' },
  dateFull: { month: '2-digit', day: '2-digit', year: '2-digit' },
  dateShort: { month: '2-digit', year: '2-digit' },
  dateFullLong: { month: 'long', day: '2-digit', year: 'numeric' },
  dateMYY: { month: '2-digit', year: 'numeric' },
  dateMYLong: { month: 'long', year: 'numeric' },
  time: { hour: '2-digit', minute: '2-digit' },
  timeFull: { hour: '2-digit', minute: '2-digit', second: '2-digit' },
  dateTime: { month: '2-digit', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' },
  dateTimeFull: { month: '2-digit', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }
}
// {style: 'decimal', useGrouping: true, minimumIntegerDigits: 10, maximumFractionDigits: 2, minimumFractionDigits: 2, minimumSignificantDigits: 5}
const numberPatterns = {
  sum: { style: 'decimal', useGrouping: true, maximumFractionDigits: 2, minimumFractionDigits: 2 },
  numberGroup: { style: 'decimal', useGrouping: true, maximumFractionDigits: 0 },
  sumDelim: { style: 'decimal', useGrouping: true, maximumFractionDigits: 2, minimumFractionDigits: 2 },
  number: { style: 'decimal', useGrouping: false, maximumFractionDigits: 0 },
  decimal1: { style: 'decimal', useGrouping: true, maximumFractionDigits: 1, minimumFractionDigits: 1 },
  decimal2: { style: 'decimal', useGrouping: true, maximumFractionDigits: 2, minimumFractionDigits: 2 },
  decimal3: { style: 'decimal', useGrouping: true, maximumFractionDigits: 3, minimumFractionDigits: 3 },
  decimal4: { style: 'decimal', useGrouping: true, maximumFractionDigits: 4, minimumFractionDigits: 4 },
  decimal5: { style: 'decimal', useGrouping: true, maximumFractionDigits: 5, minimumFractionDigits: 5 },
  decimal6: { style: 'decimal', useGrouping: true, maximumFractionDigits: 6, minimumFractionDigits: 6 }
}

const datePatternNames = Object.keys(datePatterns)
const numberPatternNames = Object.keys(numberPatterns)

/**
 * lang to ICU locale hook (if defined by setLang2LocaleHook)
 * @private
 * @type {null|Function}
 */
let l2lHook = null
const langToICU = {
  en: 'en-US',
  ru: 'ru-RU',
  uk: 'uk-UA',
  az: 'az'
}

// TODO - FIX ME by prevent `@unitybase/cs-shared` package includes into every compiled module
//  (adminui-pub, adminui-vue, vendor packages etc.).
if (typeof _defaultLang === 'undefined') {
  // eslint-disable-next-line no-global-assign
  _defaultLang = null
  setDefaultLang('en')
}

/**
 * Create a ICU locale based on UB language
 *
 * @param lang
 * @returns {string}
 */
function lang2locale (lang) {
  if (l2lHook) return l2lHook(lang)
  lang = lang || _defaultLang
  if ((lang.length < 3) && langToICU[lang]) {
    return langToICU[lang]
  } else {
    return lang + '-' + lang.toUpperCase()
  }
}

/**
 * Intl number formatters cache.
 *
 * Keys is a language, values is an object with keys is date pattern, value is Intl.NumberFormat for this pattern
 * {en: {sum: new Intl.NumberFormat('en-US', numberPatterns.sum)}
 *
 * @private
 */
let numberFormaters = {}

/**
 * Intl Date formatters cache.
 *
 * Keys is a language, values is an object with keys is date pattern, value is Intl.DateTimeFormat for this pattern
 * {en: {date: new Intl.DateTimeFormat('en-US', datePatterns.date)}
 *
 * @private
 */
let dateTimeFormaters = {}

/**
 * Format date by pattern
 *
 * @example
const formatByPattern = require('@unitybase/cs-shared').formatByPattern
const d = new Date(2020, 04, 23, 13, 14)
formatByPattern.formatDate(d, 'date') // on client can be called without 3rd lang parameter - will be formatted for user default lang (for uk - 23.05.2020)
formatByPattern.formatDate('2020-05-23', 'date', 'uk') // 23.05.2020
formatByPattern.formatDate(d, 'date', 'en') // 05/23/2020
formatByPattern.formatDate(d, 'dateTime', 'uk') // 23.05.2020 13:14
formatByPattern.formatDate(d, 'dateTimeFull', 'uk') // 23.05.2020 13:14:00
formatByPattern.formatDate(d, 'date', 'en') // 05/23/2020, 1:14 PM
 * @param {*} dateVal Date object or Number/String what will be converted to Date using new Date();
 *   null, undefined and empty string will be converted to empty string
 * @param {string} patternName One of `formatByPattern.datePatterns`
 * @param {string} [lang=defaultLang] UB language code. If not specified value defined by setDefaultLang is used
 * @returns {string}
 */
module.exports.formatDate = function (dateVal, patternName, lang = _defaultLang) {
  if (!dateVal) return ''
  if (!(dateVal instanceof Date)) dateVal = new Date(dateVal)

  // lazy create Intl object
  if (!dateTimeFormaters[lang]) dateTimeFormaters[lang] = {}
  if (!dateTimeFormaters[lang][patternName]) {
    const pattern = datePatterns[patternName]
    if (!pattern) throw new Error(`Unknown date pattern ${patternName}`)
    const locale = lang2locale(lang)
    dateTimeFormaters[lang][patternName] = new Intl.DateTimeFormat(locale, pattern)
  }
  return dateTimeFormaters[lang][patternName].format(dateVal)
}

/**
 * Format number by pattern. Use parseFloat to convert non-number numVal argument into Number. Returns empty string for `!numVal` and `NaN`
 *
 * @example
const formatByPattern = require('@unitybase/cs-shared').formatByPattern
const n = 2305.1
formatByPattern.formatNumber(n, 'sum', 'en') // 2,305.10
formatByPattern.formatNumber('2305.1', 'sum', 'en') // 2,305.10
formatByPattern.formatNumber(n, 'sum') // on client can be called without 3rd lang parameter - will be formatted for user default lang (for uk "2 305,10")
 * @param {*} numVal
 * @param {string} patternName One of `formatByPattern.datePatterns`
 * @param {string} [lang=defaultLang] UB language code. If not specified value defined by `setDefaultLang` is used
 * @returns {string}
 */
module.exports.formatNumber = function (numVal, patternName, lang = _defaultLang) {
  if (!numVal && (numVal !== 0)) return ''
  const v = (typeof numVal === 'number') ? numVal : parseFloat(numVal)
  if (Number.isNaN(v)) return ''
  // lazy create Intl object
  if (!numberFormaters[lang]) numberFormaters[lang] = {}
  if (!numberFormaters[lang][patternName]) {
    const pattern = numberPatterns[patternName]
    if (!pattern) throw new Error(`Unknown number pattern ${patternName}`)
    const locale = lang2locale(lang)
    numberFormaters[lang][patternName] = new Intl.NumberFormat(locale, pattern)
  }
  return numberFormaters[lang][patternName].format(numVal)
}

/**
 * Set application-specific UB lang to ICU locale transformation hook.
 * Default hook uses `{en: 'en-US', ru: 'ru-RU', uk: 'uk-UA', az: 'az'}` translation, any other language `ln` translated into `ln-LN`.
 *
 * Application can redefine this rule by sets his own hook, for example to translate `en -> 'en-GB'` etc.
 *
 * @param {Function} newL2lHook function what takes a UB language string and returns a ICU locale string
 */
module.exports.setLang2LocaleHook = function (newL2lHook) {
  l2lHook = newL2lHook
  // reset cache
  numberFormaters = {}
  dateTimeFormaters = {}
}
/**
 * Available date patterns
 *
 * @type {string[]}
 */
module.exports.datePatterns = datePatternNames
/**
 * Available Number patterns
 *
 * @type {string[]}
 */
module.exports.numberPatterns = numberPatternNames

/**
 * Registers custom date pattern (should be called once)
 *
 * @example
// format Date for New_York time zone
$UB.formatter.registerDatePattern('dateTimeInNewYork', {
  month: '2-digit', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  timeZone: 'America/New_York'
})
 * @param {string} patternName Pattern name
 * @param {object} intlOptions Intl.DateFormat constructor options - see https://tc39.es/ecma402/#datetimeformat-objects
 */
module.exports.registerDatePattern = function (patternName, intlOptions) {
  if (!patternName || typeof patternName !== 'string') {
    throw new Error('Invalid date pattern name')
  }
  if (datePatterns[patternName]) {
    throw new Error(`Date pattern ${patternName} already registered`)
  }
  if (!intlOptions || typeof intlOptions !== 'object') {
    throw new Error('Invalid intlOptions - should be object')
  }
  datePatterns[patternName] = intlOptions
  datePatternNames.push(patternName)
}

/**
 * Registers custom number pattern
 *
 * @param {string} patternName Pattern name
 * @param {object} intlOptions Intl.NumberFormat constructor options - see https://tc39.es/ecma402/#numberformat-objects
 */
module.exports.registerNumberPattern = function (patternName, intlOptions) {
  if (!patternName || typeof patternName !== 'string') {
    throw new Error('Invalid number pattern name')
  }
  if (numberPatterns[patternName]) {
    throw new Error(`Number pattern ${patternName} already registered`)
  }
  if (!intlOptions || typeof intlOptions !== 'object') {
    throw new Error('Invalid intlOptions - should be object')
  }
  numberPatterns[patternName] = intlOptions
  numberPatternNames.push(patternName)
}

/**
 * Gets date pattern by name
 *
 * @param {string} patternName Pattern name
 * @returns {object} Pattern description for Intl
 */
module.exports.getDatePattern = function (patternName) {
  return datePatterns[patternName] && Object.assign({}, datePatterns[patternName])
}

/**
 * Gets number pattern by name
 *
 * @param {string} patternName Pattern name
 * @returns {object} Pattern description for Intl
 */
module.exports.getNumberPattern = function (patternName) {
  return numberPatterns[patternName] && Object.assign({}, numberPatterns[patternName])
}

/**
 * Set a default language to use with `strCmp`, `formatNumber` and `formatDate`.
 * For UI this is usually a logged in user language
 *
 * @param {string} lang
 */
function setDefaultLang (lang) {
  if (_defaultLang === lang) return
  // eslint-disable-next-line no-global-assign
  _defaultLang = lang
  // eslint-disable-next-line no-global-assign
  _collator = null
  if ((typeof Intl === 'object') && Intl.Collator) {
    // eslint-disable-next-line no-global-assign
    _collator = new Intl.Collator(lang, { numeric: true })
  }
}

module.exports.setDefaultLang = setDefaultLang

/**
 * Compare two value:
 *  - if one of value is string takes into account current client locale (see setDefaultLang)
 *  - `null` and `undefined` is always less when any other value
 *  - `Date` objects compared correctly (using getTime())
 * Returns 0 if values are equal, otherwise 1 or -1
 *
 * @param {*} v1
 * @param {*} v2
 * @returns {number}
 */
module.exports.collationCompare = function (v1, v2) {
  if (_collator && ((typeof v1 === 'string') || (typeof v2 === 'string'))) { // Use collator for strings
    return _collator.compare(v1, v2)
  } else {
    // place null and undefined first (== is used instead of === to null\undefined compare)
    if ((v1 == null) && (v2 != null)) {
      return -1
    } else if ((v2 == null) && (v1 != null)) {
      return 1
    }
    // compare date using seconds since epoch
    if (v1 instanceof Date) {
      v1 = v1.getTime()
    }
    if (v2 instanceof Date) {
      v2 = v2.getTime()
    }

    if (v1 === v2) return 0
    return v1 > v2 ? 1 : -1
  }
}
