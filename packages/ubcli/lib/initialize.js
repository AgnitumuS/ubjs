/**
 * Command line module.
 *
 * Fill domain entities by it initial values: enumerate all (or specified in -m switch) models `_initialData` folders  and execute all `*.js` from there.
 * Database itself and all necessary tables must exist before call this command.
 *  - use `>ub cmd/initDB' to create a new database
 *  - use `>ub cmd/generateDDL` to create a tables
 *
 * @author pavel.mash
 * @module cmd/initialize
*/
const _ = require('lodash')
const fs = require('fs')
const path = require('path')
const {options, argv} = require('@unitybase/base')

module.exports = function initialize (cfg) {
  let session

  if (!cfg) {
    var opts = options.describe('initialize', 'Fill domain entities by it initial values using scripts from models `_initialData` folders', 'ubcli')
            .add(argv.establishConnectionFromCmdLineAttributes._cmdLineParams)
            .add({short: 'm', long: 'model', param: 'modelName', defaultValue: '*', help: 'Name of model to initialize'})
    cfg = opts.parseVerbose({}, true)
    if (!cfg) return
  }
  if (cfg.model === '*') cfg.model = ''

  session = argv.establishConnectionFromCmdLineAttributes(cfg)

  try {
    let oneModel = cfg.model

    let configFileName = argv.getConfigFileName()
    let configDir = path.dirname(configFileName)
    let config = argv.getServerConfiguration()
    let appConfig = config.application
    let domainConfig = appConfig.domain

    console.info('Scan models `_initialData` folders for initialization scripts')
    if (!_.isArray(domainConfig['models'])) {
      throw new Error('Domain.models configuration MUST be an array on object')
    }
    _.forEach(domainConfig['models'], function (modelConfig) {
      var folderName = path.join(configDir, modelConfig.path, '_initialData')

      if ((!oneModel || (modelConfig.name === oneModel)) && fs.isDir(folderName)) {
        var files = fs.readdirSync(folderName)
        files = _.filter(files, function (item) { return /\.js$/.test(item) }).sort()
        if (files.length) {
          files.forEach(function (file) {
            requireAndRun(folderName, modelConfig.name, file)
          })
        }
                // check localization

        if (fs.isDir(folderName + 'locale')) {
          var allLocalefiles = fs.readdirSync(folderName + 'locale')
          _.forEach(session.appInfo.supportedLanguages, function (lang) {
            var langFileRe = new RegExp(lang + '\\^.*\\.js$')
            files = _.filter(allLocalefiles, function (item) { return langFileRe.test(item) }).sort()
            if (files.length) {
              files.forEach(function (file) {
                requireAndRun(folderName + 'locale\\', modelConfig.name, file)
              })
            }
          })
        }
      }
    })
  } finally {
    if (session && session.logout) {
      session.logout()
    }
  }

  function requireAndRun (folderName, modelName, file) {
    var filler
    if (file.charAt(0) !== '_') {
      filler = require(path.join(folderName, file))
      if (typeof filler === 'function') {
        console.info('\tmodel:', modelName, 'file:', file)
        filler(session)
      } else {
        console.warn('File', folderName + file, 'not export function')
      }
    } else {
      console.info('File', folderName + file, 'ignored because it name start from "_"')
    }
  }
}
