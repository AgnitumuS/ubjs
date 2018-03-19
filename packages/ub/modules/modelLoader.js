const fs = require('fs')
const path = require('path')
const App = require('./App')

/**
 * Functions for evaluation UnityBase model JS files
 * @module modelLoader
 */
module.exports.loadEntitiesModules = loadEntitiesModules
module.exports.loadLegacyModules = loadLegacyModules

/**
 * Load all *.js for which there is a pair *.meta
 * @param {String} folderPath
 */
function loadEntitiesModules (folderPath) {
  if (!fs.existsSync(folderPath)) return

  let folderFiles = fs.readdirSync(folderPath)

  for (let i = 0, l = folderFiles.length; i < l; i++) {
    let fn = folderFiles[i]
    if (fn.startsWith('.') || fn.startsWith('_')) continue // skip

    let fullPath = path.join(folderPath, fn)
    let stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      if ((fn = 'modules') || (fn === 'node_modules') || (fn = 'public')) continue
      loadEntitiesModules(fullPath + path.sep)
    } else if (fn.endsWith('.js')) {
      let baseName = path.basename(fn, '.js')
      if (App.domainInfo.has(baseName)) { // this is entity module
        require(fullPath)
      }
    }
  }
}

/**
 * For UB < 4.2 compatibility -  require all non - entity js
 * in specified folder add it's subfolder,
 * exclude `modules` and `node_modules` subfolder's.
 * From 'public' subfolder only cs*.js are required.
 * To be called in model index.js as such:
 *   const modelLoader = require('@unitybase/ub).modelLoader
 *
 * For new models we recommend to require non-entity modules manually
 *
 * @param {String} folderPath
 * @param {Boolean} isFromPublicFolder
 */
function loadLegacyModules (folderPath, isFromPublicFolder = false) {
  if (!fs.existsSync(folderPath)) return

  let folderFiles = fs.readdirSync(folderPath)

  for (let i = 0, l = folderFiles.length; i < l; i++) {
    let fn = folderFiles[i]
    if (fn.startsWith('.') || fn.startsWith('_')) continue // skip

    let fullPath = path.join(folderPath, fn)
    let stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      if ((fn = 'modules') || (fn === 'node_modules') || (fn = 'public')) continue
      // prevent recursion inside public folder
      if (!isFromPublicFolder) loadLegacyModules(fullPath + path.sep, fn === 'public')
    } else if (fn.endsWith('.js') && (!isFromPublicFolder || fn.startsWith('cs'))) {
      let baseName = path.basename(fn, '.js')
      if (!App.domainInfo.has(baseName)) { // this is entity module
        require(fullPath)
      }
    }
  }
}
