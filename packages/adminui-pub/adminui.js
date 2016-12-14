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

window.Ext = require('./ext-all-debug-w-comments.js')

window.JSZip = require('jszip/dist/jszip.min.js')
window.FileSaver = require('file-saver/FileSaver.js')
window.Mustacthe = require('mustache')
window.CodeMirror = require('codemirror/lib/codemirror')
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
require('@unitybase/adminui-pub/_src/css/CodeMirror-match.css')
require('codemirror/addon/comment/comment')

  // <script defer charset="utf-8" src="{{#md5}}models/adminui/node_modules/file-saver/FileSaver.js{{/md5}}"></script>
  // <script defer charset="utf-8" src="{{#md5}}models/adminui/node_modules/mustache/mustache.js{{/md5}}"></script>
  // <script charset="utf-8" src="{{#md5}}models/adminui/node_modules/tinymce/tinymce.js{{/md5}}"></script>
  // <script charset="utf-8" src="{{#md5}}models/adminui/node_modules/codemirror/lib/codemirror.js{{/md5}}"></script>
  // <script charset="utf-8" src="{{#md5}}models/adminui/node_modules/codemirror/addon/edit/matchbrackets.js{{/md5}}"></script>
  // <script charset="utf-8" src="{{#md5}}models/adminui/node_modules/codemirror/addon/edit/closebrackets.js{{/md5}}"></script>
  // <script charset="utf-8" src="{{#md5}}models/adminui/node_modules/codemirror/addon/edit/trailingspace.js{{/md5}}"></script>
  //
  // <script charset="utf-8" src="{{#md5}}models/adminui/node_modules/codemirror/addon/fold/foldcode.js{{/md5}}"></script>
  // <script charset="utf-8" src="{{#md5}}models/adminui/node_modules/codemirror/addon/fold/foldgutter.js{{/md5}}"></script>
  // <link rel="stylesheet" href="{{#md5}}models/adminui/node_modules/codemirror/addon/fold/foldgutter.css{{/md5}}"/>
  // <script charset="utf-8" src="{{#md5}}models/adminui/node_modules/codemirror/addon/fold/brace-fold.js{{/md5}}"></script>
  // <script charset="utf-8" src="{{#md5}}models/adminui/node_modules/codemirror/addon/fold/xml-fold.js{{/md5}}"></script>
  // <script charset="utf-8" src="{{#md5}}models/adminui/node_modules/codemirror/addon/fold/comment-fold.js{{/md5}}"></script>
  //
  // <script charset="utf-8" src="{{#md5}}models/adminui/node_modules/codemirror/addon/dialog/dialog.js{{/md5}}"></script>
  // <link rel="stylesheet" href="{{#md5}}models/adminui/node_modules/codemirror/addon/dialog/dialog.css{{/md5}}"/>
  //
  //
  // <!-- script charset="utf-8" src="{{#md5}}models/adminui/node_modules/codemirror/addon/hint/simple-hint.js{{/md5}}" -->
  // <script charset="utf-8" src="{{#md5}}models/adminui/node_modules/codemirror/mode/javascript/javascript.js{{/md5}}"></script>
  // <script charset="utf-8" src="{{#md5}}models/adminui/node_modules/codemirror/addon/hint/javascript-hint.js{{/md5}}"></script>
  //
  // <script charset="utf-8" src="{{#md5}}models/adminui/node_modules/codemirror/addon/search/search.js{{/md5}}"></script>
  // <script charset="utf-8" src="{{#md5}}models/adminui/node_modules/codemirror/addon/search/searchcursor.js{{/md5}}"></script>
  // <script charset="utf-8" src="{{#md5}}models/adminui/node_modules/codemirror/addon/search/match-highlighter.js{{/md5}}"></script>
  //

Ext.Loader.setConfig({
  enabled: true,
  disableCaching: false,
  paths: {
    'Ext.ux': 'models/adminui-pub/_src/ux',
    'UB': 'models/adminui-pub/_src/app'
  }
})

require('./_src/app.js')

module.exports = {
  UB: UB
}
