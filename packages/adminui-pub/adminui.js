/*
 * Created by pavel.mash on 03.12.2016.
 */
/* global SystemJS */
const UB = require('@unitybase/ub-pub')
const _ = require('lodash')
const csShared = require('@unitybase/cs-shared')
const fileSaver = require('file-saver')
// register required modules into SystemJS registry
// to prevent double loading of modules in case for example
// System.import('lodash') somewhere in code exists
// Important to use SystemJS instead of System to prevent webpack to optimize calls to System
if (!SystemJS.has('lodash')) SystemJS.set('lodash', SystemJS.newModule(_))
if (!SystemJS.has('@unitybase/cs-shared')) SystemJS.set('@unitybase/cs-shared', SystemJS.newModule(csShared))
if (!SystemJS.has('file-saver')) SystemJS.set('file-saver', SystemJS.newModule(fileSaver))

const UBDomain = csShared.UBDomain
const LocalDataStore = csShared.LocalDataStore

/** @global */
window.UB = UB
/** @global */
window._ = _
window.UB.LocalDataStore = LocalDataStore

window.UBDomain = UBDomain // used as UBDomain.getPhysicalDataType && UBDomain.ubDataTypes
window.saveAs = fileSaver.saveAs

Ext.Loader.setConfig({
  enabled: true,
  disableCaching: false,
  paths: {
    'Ext.ux': '@unitybase/adminui-pub/_src/ux',
    UB: '@unitybase/adminui-pub/_src/app'
  }
})

const { launchApp, $App } = require('./_src/app.js')

let __cronstrue
/**
 * Parse cron expression to human-readable string according to current user language.
 *
 * $App.verbaliseCronExpression.init() should be called once before usage (lazy load cronstrue library)
 *
 * @param {string} expression Cron expression (with or without seconds)
 * @param {string} [lang] Optional language. Default is current user language
 * @returns {string}
 */
$App.verbaliseCronExpression = function (expression, lang) {
  if (__cronstrue) {
    let res
    try {
      const oncePer = expression.indexOf('@')
      const periodicalWeek = oncePer !== -1 ? expression.substring(oncePer + 1) : ''
      if (periodicalWeek) {
        expression = expression.substring(0, oncePer)
      }
      res = __cronstrue.toString(expression, { locale: _defaultLang || 'en' })
      if (periodicalWeek) {
        res += `, ${UB.i18n('UCron.oncePer')} ${periodicalWeek} ${UB.i18n('UCron.occurrence')}`
      }
    } catch (e) {
      res = e.message || e
    }
    return res
  }
  console.warn('$App.verbaliseCronExpression not initialized. Call $App.verbaliseCronExpression.init() once before usage')
  return expression // cronstrue is not loaded yet
}

/**
 * Cron expression verbalize initialization (async). Must be called once before using of `$App.verbaliseCronExpression`
 * @returns {Promise}
 */
$App.verbaliseCronExpression.init = function () {
  return SystemJS.import('cronstrue/dist/cronstrue-i18n.min.js').then(cronstrue => {
    __cronstrue = cronstrue
    if (!SystemJS.has('cronstrue')) SystemJS.set('cronstrue', SystemJS.newModule(__cronstrue))
    return __cronstrue
  })
}

launchApp()

module.exports = $App
if (!SystemJS.has('@unitybase/adminui-pub')) SystemJS.set('@unitybase/adminui-pub', SystemJS.newModule($App))

if (document.ontouchstart !== undefined) window.addEventListener('resize', scrollInputIntoViewport)

const keyboardAppearsElements = new Set(['INPUT', 'TEXTAREA'])
/**
 * Scroll input into viewport when screen is resized (usually because keyboard appears)
 * Added only for touch devices.
 * This hack is added because Ext based viewport layout fixes viewport height
 * TODO - remove when viewport will be rewritten without ExtJS
 */
function scrollInputIntoViewport () {
  const target = document.activeElement
  if (!keyboardAppearsElements.has(target.nodeName)) return
  const position = target.getBoundingClientRect()
  if (position.bottom < document.documentElement.clientHeight) return
  setTimeout(() => {
    target.scrollIntoView()
  }, 150)
}
