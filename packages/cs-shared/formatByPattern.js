/**
 * Dates and Numbers formatting using Intl
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
  dateFullLong: { month: 'long', day: '2-digit', year: '2-digit' },
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

/**
 * Keys is a language, values is an object with keys is date pattern, value is Intl.DateTimeFormat for this pattern
 * {en: {date: new Intl.DateTimeFormat('en-US', datePatterns.date)}
 */
const dateTimeFormaters = {}

const langToICU = {
  en: 'en-US',
  ru: 'ru-RU',
  uk: 'uk-UA',
  az: 'az'
}

/**
 * Keys is a language, values is an object with keys is date pattern, value is Intl.NumberFormat for this pattern
 * {en: {sum: new Intl.NumberFormat('en-US', numberPatterns.sum)}
 */
const numberFormaters = {}

/**
 * Create a ICU locale based on UB language
 * @param lang
 * @return {string}
 */
function lang2locale (lang) {
  lang = lang || 'en'
  if ((lang.length < 3) && langToICU[lang]) {
    return langToICU[lang]
  } else {
    return lang + '-' + lang.toUpperCase()
  }
}
/**
 * Format date by pattern
 * @example
    const formatByPattern = require('@unitybase/cs-shared').formatByPattern
    const d = new Date(20202, 04, 23, 13, 14)
    formatByPattern.formatDate(d, 'date', 'uk') // 23.05.2020
    formatByPattern.formatDate(d, 'date', 'en') // 05/23/2020
    formatByPattern.formatDate(d, 'dateTime', 'uk') // 23.05.2020 13:14
    formatByPattern.formatDate(d, 'date', 'en') // 05/23/2020, 1:14 PM
 *
 * @param {Date} dateVal
 * @param {string} patternName One of `formatByPattern.datePatterns`
 * @param {string} lang UB language code
 * @return {string}
 */
module.exports.formatDate = function (dateVal, patternName, lang) {
  if (!dateVal) return
  if (!(dateVal instanceof Date)) throw new Error('Value must be Date')
  const pattern = datePatterns[patternName]
  if (!pattern) throw new Error(`Unknown date pattern ${patternName}`)

  // lazy create Intl object
  if (!dateTimeFormaters[lang]) dateTimeFormaters[lang] = {}
  if (!dateTimeFormaters[lang][patternName]) {
    const locale = lang2locale(lang)
    dateTimeFormaters[lang][patternName] = new Intl.DateTimeFormat(locale, pattern)
  }
  return dateTimeFormaters[lang][patternName].format(dateVal)
}

/**
 * Format number by pattern
 * @example
 const formatByPattern = require('@unitybase/cs-shared').formatByPattern
 const n = 2305.1
 formatByPattern.formatNumber(n, 'sum', 'en') // 2,305.10
 formatByPattern.formatNumber(n, 'sum', 'uk') // 2 305,10
 *
 * @param {Number} numVal
 * @param {string} patternName One of `formatByPattern.datePatterns`
 * @param {string} lang UB language code
 * @return {string}
 */
module.exports.formatNumber = function (numVal, patternName, lang) {
  if (Number.isNaN(numVal)) return 'NaN'
  if (!numVal && numVal !== 0) return ''
  if (typeof numVal !== 'number') throw new Error('Value must be Number')
  const pattern = numberPatterns[patternName]
  if (!pattern) throw new Error(`Unknown number pattern ${patternName}`)
  // lazy create Intl object
  if (!numberFormaters[lang]) numberFormaters[lang] = {}
  if (!numberFormaters[lang][patternName]) {
    const locale = lang2locale(lang)
    numberFormaters[lang][patternName] = new Intl.NumberFormat(locale, pattern)
  }
  return numberFormaters[lang][patternName].format(numVal)
}

/**
 * Available date patterns
 * @type {string[]}
 */
module.exports.datePatterns = Object.keys(datePatterns)
/**
 * Available Number patterns
 * @type {string[]}
 */
module.exports.numberPatterns = Object.keys(numberPatterns)
