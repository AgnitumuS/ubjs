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
// commented by MPV on 2019-03-01 - required in ubs
// window.JSZip = require('jszip/dist/jszip.js') // for xlsx-pub. require('jszip') dose not work
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
 * During first call function lazy loads a `cronstrue` library and returns non-parsed expression, so should be
 * called once before usage as `$App.verbaliseCronExpression('')`
 *
 * @param {string} expression Cron expression (with or without seconds)
 * @param {string} [lang] Optional language. Default is current user language
 * @returns {string}
 */
$App.verbaliseCronExpression = function (expression, lang) {
  if (__cronstrue) {
    let res
    try {
      res = __cronstrue.toString(expression, { locale: _defaultLang || 'en' })
    } catch (e) {
      res = e.message || e
    }
    return res
  }
  SystemJS.import('cronstrue/dist/cronstrue-i18n.min.js').then(cronstrue => {
    __cronstrue = cronstrue
  })
  return expression // cronstrue is not loaded yet
}

launchApp()

module.exports = $App
if (!SystemJS.has('@unitybase/adminui-pub')) SystemJS.set('@unitybase/adminui-pub', SystemJS.newModule($App))
