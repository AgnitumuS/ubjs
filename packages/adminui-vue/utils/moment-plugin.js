/* global SystemJS */
const IS_SYSTEM_JS = (typeof SystemJS !== 'undefined')
const moment = require('moment')
if (IS_SYSTEM_JS && !SystemJS.has('moment')) {
  moment.__useDefault = moment
  SystemJS.set('moment', SystemJS.newModule(moment))
}

const UB = require('@unitybase/ub-pub')

function setLocale (lang) {
  window.moment = moment
  if (lang === 'en') return
  // moment locales are in BROKEN UMD format and require ('../moment') inside
  // to prevent loading of moment.js twice fallback to global + UB.inject
  return UB.inject(`clientRequire/moment/locale/${lang}.js`).then(
    () => { moment.locale(lang) }
  )
}

module.exports = {
  async install (Vue) {
    // connection may not exists on login form
    if (UB.connection) await setLocale(UB.connection.userLang())
    Vue.prototype.$moment = moment
  }
}
