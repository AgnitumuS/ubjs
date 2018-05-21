/**
 * Create internal BLOB store structure (folders) for specifies FileSystem store.
 *
 * Must be used on the same computer where UnityBase server installed ( remote server connection is not supported).
 *
 * Usage from a command line:

    ubcli createStore -?

 * Usage from a script:

     const storeCreator = require('@unitybase/ubcli/createStore')
     let options = {
        store: "*"
     };
     storeCreator(options)

 * @author pavel.mash
 * @module createStore
 * @memberOf module:@unitybase/ubcli
 */

const _ = require('lodash')
const fs = require('fs')
const path = require('path')
const cmdLineOpt = require('@unitybase/base').options
const argv = require('@unitybase/base').argv

const RE_TRAILING_PATH_SEP = process.platform === 'win32' ? /\\$/ : /\/$/

module.exports = function createStore (options) {
  let
    configFileName,
    configPath,
    config,
    app,
    storeNames,
    selectedStores

  if (!options) {
    let opts = cmdLineOpt.describe('createStore',
          'Create internal store structure (folders) for specifies FileSystem store. Must be used on the same computer where UnityBase server installed',
          'ubcli'
      )
      .add({short: 'cfg', long: 'cfg', param: 'serverConfig', defaultValue: 'ubConfig.json', help: 'Server config'})
      .add({short: 'store', long: 'store', param: 'storesList', defaultValue: '*', help: 'Comma separated blob stores list'})
    options = opts.parseVerbose({}, true)
    if (!options) return
  }
  storeNames = options.store
  configFileName = argv.getConfigFileName()

  if (!configFileName) {
    throw new Error('Invalid server config path')
  }

  config = argv.getServerConfiguration()
  app = config.application

  if (!app.blobStores) {
    throw new Error('No "blobStores" section inside application config')
  }
  if (!Array.isArray(app.blobStores) || !app.blobStores.length) {
    throw new Error('"blobStores" config section must be in 1.11 format - an non-empty ARRAY of named object')
  }

  if (storeNames) {
    storeNames = storeNames.split(',')
    selectedStores = _.filter(app.blobStores, function (store) {
      return (storeNames.indexOf(store.name) !== -1)
    })
    if (!selectedStores.length) {
      throw new Error('No store with names, passed in "-store" cmd line switch found')
    }
  } else {
    selectedStores = app.blobStores
  }

  configPath = path.dirname(configFileName)

  function createOneStore (cStore) {
    console.log('Start handle blobStore "%s"', cStore.name)
    if (!cStore['storeType']) {
      cStore['storeType'] = 'FileSystem'
    }
    if (!cStore.path) {
      console.log(`\tskipped - path not defined`)
      return
    }
    let cStorePath = cStore.path
    if (!path.isAbsolute(cStorePath)) cStorePath = path.join(configPath, cStorePath)
    if (!RE_TRAILING_PATH_SEP.test(cStorePath)) {
      cStorePath += path.sep
    }
    console.log('\tresolved to path', cStorePath)
    if (!fs.existsSync(cStorePath)) {
      console.log('\tresolved path not exists. Do force directory')
      fs.mkdirSync(cStorePath)
    }
    let tmp = cStore.tempPath || (cStorePath + '_temp')
    if (!fs.existsSync(tmp)) {
      console.log('\t Create temp directory %s', tmp)
      fs.mkdirSync(tmp)
    }
    console.log('Done!')
  }

  selectedStores.forEach(createOneStore)
}
