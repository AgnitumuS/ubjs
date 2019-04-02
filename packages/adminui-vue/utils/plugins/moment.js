/* global SystemJS */
const IS_SYSTEM_JS = (typeof SystemJS !== 'undefined')
const moment = require('moment')
if (IS_SYSTEM_JS && !SystemJS.has('moment')) SystemJS.set('moment', SystemJS.newModule(moment))

const UB = require('@unitybase/ub-pub')

async function setLocale (lang) {
  if (lang === 'en') return
  const langData = await SystemJS.import(`moment/locale/${lang}`)
  moment.locale(langData._config.abbr, langData._config)
}

module.exports = {
  async install (Vue) {
    // connection may not exists on login form
    if (UB.connection) await setLocale(UB.connection.userLang())
    Vue.prototype.$moment = moment
  }
}
