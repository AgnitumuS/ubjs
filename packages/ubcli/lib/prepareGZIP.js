/**
 * Command line module.
 *
 * GZIP `staticFolder` files according to `usePreparedGzip` `headersPostprocessors` for specified application
 *
 * Usage:
 *
 *	    >ub.exe cmd/prepareGZIP -help
 *
 * For example during deploy UnityBase documentation to {@link https://unitybase.info/api/server/} we execute:
 *
 *      > ub cmd/prepareGZIP -cfg pathToDocumentationConfig.json
 *
 * @author pavel.mash
 * @module cmd/prepareGZIP
 */
const _ = require('lodash')
const fs = require('fs')
const path = require('path')
const {options, argv} = require('@unitybase/base')
const util = require('util')
const gzipFile = require('UBCompressors').gzipFile

module.exports = function prepareGZIP (cfg) {
  var
    configFileName = argv.getConfigFileName(),
    configPath,
    config, inetPub

  if (!cfg) {
    var opts = options.describe('cmd/prepareGZIP', 'GZIP `staticFolder` files according to `usePreparedGzip` `staticRules` for specified application')
            .add({short: 'cfg', long: 'cfg', param: 'localServerConfig', defaultValue: 'ubConfig.json', searchInEnv: false, help: 'Path to server config'})
            .add({short: 'd', long: 'deleteOriginals', defaultValue: false, help: 'Delete source files we compress(not recommended if you have a client what not support compression'})
            .add({short: 'largeWhen', long: 'largeWhen', param: 'size', defaultValue: 3 * 1024, help: 'ompress only files with size > largeWhen bytes'})
    cfg = opts.parseVerbose({}, true)
    if (!cfg) return
  }
  var deleteOriginals = cfg.deleteOriginals
  var largeWhen = cfg.largeWhen

  config = argv.getServerConfiguration()

  if (!config.httpServer || !config.httpServer.inetPub) {
    console.warn('config.httpServer.inetPub not configured')
    return
  }
  inetPub = config.httpServer.inetPub
  var headersPostprocessors = config.httpServer.headersPostprocessors

  var gzipRules = _.filter(headersPostprocessors, {usePreparedGzip: true})
  if (!gzipRules.length) {
    console.warn('header post-processors with `usePreparedGzip: true` option not found')
    return
  }

    // create regular expressions file name must be test with
  gzipRules.forEach(function (rule) {
    console.log('Apply rule:', rule.location, 'for files large when', largeWhen, 'bytes')
    rule.re = new RegExp(rule.location)
  })

  configPath = path.dirname(configFileName)
  var startFrom = relToAbs(configPath, inetPub)
  var endWith = startFrom.charAt(startFrom.length - 1)
  if ((endWith !== '\\') && (endWith !== '/')) {
    startFrom += '/'
  }
  if (!fs.isDir(startFrom)) {
    console.warn('inetPub root "%s" dose not exists', startFrom)
    return
  } else {
    console.debug('Start scanning folder', startFrom)
  }

  var totalSize = 0, totalGZSize = 0, totalCount = 0, totalGZCount = 0

  function gzipFolder (startFromPath) {
    var
            fullFileName, folderContent, sz

    folderContent = fs.readdirSync(startFromPath)

    folderContent.forEach(function (fileName) {
      fullFileName = startFromPath + fileName
      if (fs.isDir(fullFileName)) {
        gzipFolder(fullFileName + '\\')
      } else {
        ++totalCount; util.print('.')
                // console.debug('Try', fullFileName);
        if (_.some(gzipRules, function (rule) { return rule.re.test(fullFileName) })) { // some of usePreparedGzip rule is applied to this file
          sz = fs.statSync(fullFileName).size; totalSize += sz
          if (sz > largeWhen) { // more when 3kb
            gzipFile(fullFileName, fullFileName + '.gz')
            totalGZSize += fs.statSync(fullFileName + '.gz').size
            ++totalGZCount
            if (deleteOriginals) {
              fs.unlinkSync(fullFileName)
            }
          }
        }
      }
    })
  }

  gzipFolder(startFrom)
  util.print('\n')
  console.log('Compress %d of %d files from %d to %d bytes (%d bytes traffic savings)', totalGZCount, totalCount, totalSize, totalGZSize, totalGZSize ? totalGZSize - totalSize : 0)
}
