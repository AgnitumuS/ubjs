/*
 * Created by pavel.mash on 03.12.2016.
 */

const UB = require('@unitybase/ub-pub')
const Q = require('bluebird-q')
const _ = require('lodash')
const csShared = require('@unitybase/cs-shared')
const UBDomain = csShared.UBDomain
const LocalDataStore = csShared.LocalDataStore

/** @global */
window.UB = UB
/** @global */
window._ = _
window.UB.LocalDataStore = LocalDataStore

window.Q = Q
window.UBDomain = UBDomain // used as UBDomain.getPhysicalDataType && UBDomain.ubDataTypes

if (!Promise.prototype.fin) {
  // eslint-disable-next-line no-extend-native
  Promise.prototype.fin = function (cb) {
    const res = () => this
    const fin = () => Promise.resolve(cb()).then(res)
    return this.then(fin, fin)
  }
}

if (!Promise.prototype.done) {
  // eslint-disable-next-line no-extend-native
  Promise.prototype.done = Promise.prototype.then
}

window.JSZip = require('jszip/dist/jszip.js') // for xlsx-pub. require('jszip') dose not work
window.saveAs = require('file-saver').saveAs

Ext.Loader.setConfig({
  enabled: true,
  disableCaching: false,
  paths: {
    'Ext.ux': '@unitybase/adminui-pub/_src/ux',
    'UB': '@unitybase/adminui-pub/_src/app'
  }
})

let {launchApp, $App} = require('./_src/app.js')
launchApp()

module.exports = $App
