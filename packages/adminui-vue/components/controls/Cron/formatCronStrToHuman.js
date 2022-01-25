const cronstrue = require('../../../../adminui-pub/node_modules/cronstrue/i18n')
// оставил так. При подключении пакета, как указано ниже - не собирается дока.  `...SystemJS is not defined...`
// const cronstrue = require('@unitybase/adminui-pub').cronstrue

/**
 * @param expression {string} cron expression
 * @param locale {string} user locale
 * @returns {string}
 */
function formatCronStrToHuman (expression = '', locale = 'en') {
  let str = ''
  try {
    str = cronstrue.toString(expression, { locale })
  } catch (err) {
    console.log(err)
  } finally {
    return str
  }
}

module.exports = formatCronStrToHuman
