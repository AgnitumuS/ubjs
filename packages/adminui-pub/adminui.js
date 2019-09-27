/*
 * Created by pavel.mash on 03.12.2016.
 */
/* global SystemJS */
const UB = require('@unitybase/ub-pub')
const Q = require('bluebird-q')
const _ = require('lodash')
const csShared = require('@unitybase/cs-shared')
const fileSaver = require('file-saver')
// register required modules into SystemJS registry
// to prevent double loading of modules in case for example
// System.import('lodash') somewhere in code exists
// Important to use SystemJS instead of System to prevent webpack to optimize calls to System
if (!SystemJS.has('lodash')) SystemJS.set('lodash', SystemJS.newModule(_))
if (!SystemJS.has('bluebird-q')) SystemJS.set('bluebird-q', SystemJS.newModule(Q))
if (!SystemJS.has('@unitybase/cs-shared')) SystemJS.set('@unitybase/cs-shared', SystemJS.newModule(csShared))
if (!SystemJS.has('file-saver')) SystemJS.set('file-saver', SystemJS.newModule(fileSaver))

const UBDomain = csShared.UBDomain
const LocalDataStore = csShared.LocalDataStore

/** @global */
window.UB = UB
/** @global */
window._ = _
window.UB.LocalDataStore = LocalDataStore

window.Q = Q
window.UBDomain = UBDomain // used as UBDomain.getPhysicalDataType && UBDomain.ubDataTypes

if (!Promise.prototype.fin) { // Q Promises hack
  // eslint-disable-next-line no-extend-native
  Promise.prototype.fin = function (cb) {
    const res = () => this
    const fin = () => Promise.resolve(cb()).then(res)
    return this.then(fin, fin)
  }
}

if (!Promise.prototype.finally) { // winXP hack
  // eslint-disable-next-line no-extend-native
  Promise.prototype.finally = function (cb) {
    const res = () => this
    const fin = () => Promise.resolve(cb()).then(res)
    return this.then(fin, fin)
  }
}

if (!Promise.prototype.done) { // Q Promises hack
  // eslint-disable-next-line no-extend-native
  Promise.prototype.done = Promise.prototype.then
}

// commented by MPV on 2019-03-01 - required in ubs
// window.JSZip = require('jszip/dist/jszip.js') // for xlsx-pub. require('jszip') dose not work
window.saveAs = fileSaver.saveAs

Ext.Loader.setConfig({
  enabled: true,
  disableCaching: false,
  paths: {
    'Ext.ux': '@unitybase/adminui-pub/_src/ux',
    'UB': '@unitybase/adminui-pub/_src/app'
  }
})

let { launchApp, $App } = require('./_src/app.js')
launchApp()

module.exports = $App
if (!SystemJS.has('@unitybase/adminui-pub')) SystemJS.set('@unitybase/adminui-pub', SystemJS.newModule($App))
