/*
* Created by xmax on 17.02.2018
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
 * @param value
 * @param patternName
 * @param lang
 * @return {string}
 */
function formatDate (value, patternName, lang) {
  if (!value) return
  if (!(value instanceof Date)) throw new Error('Value must be Date')
  const pattern = datePatterns[patternName]
  if (!pattern) throw new Error('Unknown date pattern ' + patternName)

  // lazy create Intl object
  if (!dateTimeFormaters[lang]) dateTimeFormaters[lang] = {}
  if (!dateTimeFormaters[lang][patternName]) {
    let locale = lang2locale(lang)
    dateTimeFormaters[lang][patternName] = new Intl.DateTimeFormat(locale, pattern)
  }
  return dateTimeFormaters[lang][patternName].format(value)
}

/**
 * Format number by pattern
 * @param value
 * @param patternName
 * @param lang
 * @return {string}
 */
function formatNumber (value, patternName, lang) {
  if (Number.isNaN(value)) return 'NaN'
  if (!value && value !== 0) return ''
  if (typeof value !== 'number') throw new Error('Value must be Number')
  const pattern = numberPatterns[patternName]
  if (!pattern) throw new Error('Unknown number pattern ' + patternName)
  // lazy create Intl object
  if (!numberFormaters[lang]) numberFormaters[lang] = {}
  if (!numberFormaters[lang][patternName]) {
    let locale = lang2locale(lang)
    numberFormaters[lang][patternName] = new Intl.NumberFormat(locale, pattern)
  }
  return numberFormaters[lang][patternName].format(value)
}

module.exports = {
  formatDate: formatDate,
  formatNumber: formatNumber,
  datePatterns: Object.keys(datePatterns),
  numberPatterns: Object.keys(numberPatterns)
}
