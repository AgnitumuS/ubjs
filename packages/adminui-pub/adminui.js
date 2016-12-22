/**
 * Created by pavel.mash on 03.12.2016.
 */

const UB = require('@unitybase/ub-pub')
const Q = require('bluebird-q')
const _ = require('lodash')
const UBDomain = require('@unitybase/base/UBDomain')
const LocalDataStore = require('@unitybase/base/LocalDataStore')

// const ClientRepository = require('./../ClientRepository')
// const UBConnection = require('./../UBConnection')
// const UBNativeMessage = require('./../UBNativeMessage')
// const UBNativeDocEdit = require('./../UBNativeDocEdit')
// const UBNativeDSTUCrypto = require('./../UBNativeDSTUCrypto')
// const UBNativeIITCrypto = require('./../UBNativeIITCrypto')
// const UBNativeScanner = require('./../UBNativeScanner')
// const UBNativePDFSign = require('./../UBNativePDFSign')

/** @global */
window.UB = UB
/** @global */
window._ = _
// window.UB.ClientRepository = core.ClientRepository
window.UB.LocalDataStore = LocalDataStore

// window.UBConnection = UBConnection
window.Q = Q
// window.CryptoJS = CryptoJS
window.UBDomain = UBDomain // used as UBDomain.getPhysicalDataType && UBDomain.ubDataTypes
// window.UBNativeMessage = UBNativeMessage
// window.UBNativeDocEdit = UBNativeDocEdit
// window.UBNativeDSTUCrypto = UBNativeDSTUCrypto
// window.UBNativeIITCrypto = UBNativeIITCrypto
// window.UBNativeScanner = UBNativeScanner
// window.UBNativePDFSign = UBNativePDFSign

if (!Promise.prototype.fin) {
  // noinspection Eslint
  Promise.prototype.fin = function (cb) {
    const res = () => this
    const fin = () => Promise.resolve(cb()).then(res)
    return this.then(fin, fin)
  }
}

if (!Promise.prototype.done) {
  // noinspection Eslint
  Promise.prototype.done = Promise.prototype.then
}

window.JSZip = require('jszip/dist/jszip.min.js')
window.saveAs = require('file-saver/FileSaver.js').saveAs
window.Mustacthe = require('mustache')
window.CodeMirror = require('codemirror/lib/codemirror')
require('codemirror/lib/codemirror.css')
require('codemirror/addon/edit/matchbrackets')
require('codemirror/addon/edit/closebrackets')
require('codemirror/addon/edit/trailingspace')
require('codemirror/addon/fold/foldcode')
require('codemirror/addon/fold/foldgutter')
require('codemirror/addon/fold/foldgutter.css')
require('codemirror/addon/fold/brace-fold')
require('codemirror/addon/fold/xml-fold')
require('codemirror/addon/fold/comment-fold')
require('codemirror/addon/dialog/dialog')
require('codemirror/addon/dialog/dialog.css')
require('codemirror/mode/javascript/javascript')
require('codemirror/addon/hint/show-hint')
require('codemirror/addon/hint/show-hint.css')
require('codemirror/addon/hint/javascript-hint')
require('codemirror/addon/search/search')
require('codemirror/addon/search/searchcursor')
require('codemirror/addon/scroll/annotatescrollbar')
require('codemirror/addon/search/matchesonscrollbar')
require('codemirror/addon/search/match-highlighter')
require('./_src/css/CodeMirror-match.css')
require('codemirror/addon/comment/comment')

window.tinymce = require('tinymce/tinymce.js')

// require('./ub-css-all.css') TODO - add icons to this module

Ext.Loader.setConfig({
  enabled: true,
  disableCaching: false,
  paths: {
    'Ext.ux': 'models/adminui-pub/_src/ux',
    'UB': 'models/adminui-pub/_src/app'
  }
})

let launcher = require('./_src/app.js')
launcher()

module.exports = {
  UB: UB
}
