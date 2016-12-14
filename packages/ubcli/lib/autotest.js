/**
 * Run automatic test by enumerating all *models* & *modules* `_autotest` folders and execute all *.js from there.
 *
 * Application must be initialized before autotest call (run `createNewApp.cmd` from your application folder)
 *
 *      >ub cmd/autotest
 *
 * Warning! Some autotest may be designed to run only once after application initialization
 *
 * @module cmd/autotest
 */
const _ = require('lodash')
const fs = require('fs')
const util = require('util')
const path = require('path')
const cmdLineOpt = require('@unitybase/base/options')
const argv = require('@unitybase/base/argv')

module.exports = function autotest (options) {
  var testResults = []
  var lastModelName
  var realConsoleDebug = console.debug
  var debugOutput = []

  if (!options) {
    var opts = cmdLineOpt.describe('cmd/autotest', 'Run autotest for application using scripts from models `_autotest` folders', 'ubcli')
            .add(argv.establishConnectionFromCmdLineAttributes._cmdLineParams)
            .add({short: 'm', long: 'models', param: 'modelsList', defaultValue: '*', help: 'Comma separated model names list for run autotest'})
            .add({short: 'skipModules', long: 'skipModules', defaultValue: false, help: 'Do not run autotest for a build-in modules'})
    options = opts.parseVerbose({}, true)
    if (!options) return
  }

    // redefine debug output
  console.debug = function () {
    debugOutput.push(util.format.apply(this, arguments))
  }

  argv.serverSessionFromCmdLineAttributes(options)

  let configFileName, configDir, config, appConfig, domainConfig

  configFileName = argv.getConfigFileName()
  configDir = path.dirname(configFileName)
  config = argv.getServerConfiguration()
  appConfig = config.application
  domainConfig = appConfig.domain

  let modulesRoot = path.join(process.binPath, 'node_modules')
  let moduleFolders = fs.readdirSync(modulesRoot)
  let folderName
  let skipModules = options.skipModules
  let inModels = options.models
  let models

  console.time('Total time')
  if (!skipModules) {
    console.info('Scan modules `_autotest` folders')
    moduleFolders.forEach(function (moduleFolder) {
      folderName = modulesRoot + moduleFolder + '\\_autotest\\'
      if (fs.isDir(folderName)) {
        var files = fs.readdirSync(folderName)
        files = _.filter(files, function (item) {
          return /\.js$/.test(item)
        }).sort()
        if (files.length) {
          files.forEach(function (file) {
            requireAndRun(folderName, moduleFolder, file)
          })
        }
      }
    })
  }

  console.info('Scan models `_autotest` folders')

  models = domainConfig['models']
  if (!_.isArray(models)) {
    throw new Error('models configuration MUST be an array on object')
  }

  if (inModels) {
    models = _.filter(models, function (modelConfig) { return inModels.indexOf(modelConfig.name) >= 0 })
  }

  _.forEach(models, function (modelConfig) {
    folderName = path.join(configDir, modelConfig.path, '_autotest')

    if (fs.isDir(folderName)) {
      var files = fs.readdirSync(folderName)
      files = _.filter(files, function (item) { return /\.js$/.test(item) }).sort()
      if (files.length) {
        files.forEach(function (file) {
          requireAndRun(folderName, modelConfig.name, file)
        })
      }
    }
  })
  console.timeEnd('Total time')

    // return console.debug back
  console.debug = realConsoleDebug

  var failed = _.filter(testResults, {result: false})
  global._timerLoop.setTimeoutWithPriority(
        function () {
          process.on('exit', function () {
            console.info((testResults.length - failed.length) + ' of ' + testResults.length + ' tests passed')
            if (failed.length) {
              fs.writeFileSync(process.cwd() + '_autotestResults.json', JSON.stringify(failed, null, '\t'))
              console.error(failed.length + ' tests fail. See ' + process.cwd() + '_autotestResults.json for details')
              throw new Error('Autotest complete with errors')
            }
          })
        },
        0,
        1000
    )

  function requireAndRun (folderName, modelName, file) {
    let testModule
    let stack
    let lineNumRe
    let res = {}
    let lineNum

    if (file.charAt(0) !== '_') {
      if (modelName !== lastModelName) {
        console.info('+ Start tests for ' + modelName)
        lastModelName = modelName
      }
      debugOutput = []
      try {
        console.info('\t + run ' + file)
        testModule = require(path.join(folderName, file))
        if (typeof testModule === 'function') {
          console.info('\tfolder:', modelName, 'file:', file)
          testModule(options)
        }
        res = {folder: modelName, file: file, result: true}
      } catch (e) {
        stack = e.stack
        lineNumRe = new RegExp(file + ':(\\d)')
        lineNum = lineNumRe.exec(stack)
        res = {folder: modelName, file: file, result: false, msg: e.toString()}
        if (lineNum) { res.errorLine = parseInt(lineNum[1], 10) }
        res.stack = stack.split('\n')
      }
      if (debugOutput.length) { res.debugOutput = debugOutput /* .join('\n'); */ }
      testResults.push(res)
    } else {
      console.info('File', folderName + file, 'ignored because it name start from "_"')
    }
  }
}
