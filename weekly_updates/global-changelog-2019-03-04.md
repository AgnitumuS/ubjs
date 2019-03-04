#  Package ub-pub@5.2.29->5.2.31
### Changed:
 - use webpack4 for production build
### Fixed:
 - **CRITICAL** `ClientRepository.selectScalar` return `undefined` for cached entities
 even if row exists

#  Package systemjs-plugin-vue-ub@1.2.2->1.2.5
### Changed:
 - use webpack4 for production build

#  Package ubq@5.2.11->5.2.14
### Changed:
 - Mail scheduler job will handle messages in the order
 of their arrival - added `.orderBy('[ID]')`
       

#  Package uba@5.1.15->5.1.17
### Added:
 - navshortcuts access initialization for Supervisor role

#  Package ubs@5.2.0->5.2.3
### Added:
 - navshortcuts access initialization for Supervisor role
### Changed:
 - use webpack4 for production build

#  Package pdf@5.0.16->5.0.18
### Changed:
 - use webpack4 for production build

#  Package blob-stores@5.0.34->5.0.36
### Added:
 - new method `blobStore.writeDocumentToResp` to respond to a parsed Document request

#  Package xlsx@5.0.41->5.0.45
### Changed:
 - use webpack4 for production build

#  Package adminui-vue@1.2.2->1.3.1
### Changed:
 - update vue@2.6.7 -> 2.6.8
 - set fixed version of element-ui@2.5.4 because of theme bug in 2.6.x
 - **BREAKING** dialogs functions now return native Promise - without a legacy `.done` method.
 All occurrence of `.done` should be replaced to `.then()[.catch()]`
 - webpack4 is used for compile production mode
 - updated vue@2.6.6 -> vue@2.6.7
 - upgraded vue-loader@14.2.4 -> vue-loader@15.6.4
### Fixed:
 - move `normalize.css` to dependencies from devDependencies to allow use a `-dev` mode
 even if modules are installed with `NODE_ENV=production`
 - relogon form should not close on Esc

#  Package adminui-pub@5.7.0->5.8.1
### Added:
 - `element-ui` library registered is SystemJS.map (used in DEV mode of adminui-vue)
### Changed:
 - remove preset-es215-without-strict from webpack config - webpack4 do all well w/o this preset
 - **BREAKING** `window.JSZip` is removed
 - UBTheme.css removed (deprecated)
 - css for Right-To-Left locales are removed (nobody uses it)
 - packages updated `bluebird 3.4.6 -> 3.5.3`, `codemirror 5.20.2 -> 5.44.0`, `es6-promise 4.1.1 -> 4.2.6`
 - webpack@4 is used for production build
 - all production css are optimized using -O2 optimization level
 - CodeMirror & mxGraph now not included in boundle and loaded on demand from their own packages
 - removed most of IE11- hacks from Ext-all (-4Kb)
 - `Ext.data.proxy.Rest`, `Ext.data.reader.Xml`, `Ext.data.writer.Xml`, and `Ext.data.XmlStore` are removed
 - support for IE < 11 is removed from Ext.Array
