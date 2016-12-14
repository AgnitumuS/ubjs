/**
 * Command line module.
 *
 * Rebuild Full Text Search (FTS) indexes if any
 *
 * Usage:
 *
 *	>ub.exe cmd/ftsReindex -help
 *
 * @author pavel.mash
 * @module cmd/ftsReindex
 */

const assert = require('assert')
const fs = require('fs')
const http = require('http')
const {options, argv} = require('@unitybase/base')

module.exports = function ftsReindex (cfg) {
  if (!cfg) {
    var opts = options.describe('cmd/ftsReindex',
                'Rebuild Full Text Search (FTS) index'
            )
            .add(argv.establishConnectionFromCmdLineAttributes._cmdLineParams)
            .add({short: 'e', long: 'entity', param: 'entityCode', defaultValue: '*', help: 'Entity code to rebuild index for. If FTS scope for entity = "Connection" then the same as -c'})
            .add({short: 'c', long: 'connection', param: 'ftsConnectionName', defaultValue: 'ftsDefault', help: 'Name of connection for index rebuild. ALL entity with this fts.connection will be reindexed'})
            .add({short: 'chunk', long: 'chunk', param: 'chunkLength', defaultValue: 10000, help: 'The number of records that can be selected and committed at once'})
            .add({short: 'limit', long: 'limit', param: 'limitCount', defaultValue: -1, help: 'Limit of reindexed records for developer or debug purpose. Do not set "limit" in other cases'})
    cfg = opts.parseVerbose({}, true)
    if (!cfg) return
  }
  var
        session, conn, req, reindexFor, reindexLimit, reindexChunk

    // increase receive timeout to 5hours - in case DB server is slow we can easy reach 30s timeout
  http.setGlobalConnectionDefaults({receiveTimeout: 5 * 60 * 60 * 1000})
  session = argv.establishConnectionFromCmdLineAttributes(cfg)
  conn = session.connection
  reindexFor = cfg.connection
  reindexLimit = cfg.limit
  reindexChunk = cfg.chunk
  if (reindexFor) { // connection
    console.info('Start reindex FTS for connection', reindexFor)
    req = {
      entity: 'fts_' + reindexFor,
      method: 'ftsreindex'
    }
    if (reindexLimit !== -1) {
      req._ftsReindexLimit = reindexLimit
    }
    if (reindexChunk) {
      req._ftsReindexChunk = reindexChunk
    }
  } else if (cfg.entity) { // entity
    reindexFor = cfg.entity
    console.info('Start reindex FTS for entity', reindexFor)
    req = {
      entity: reindexFor,
      method: 'ftsreindex'
    }
    if (reindexLimit !== -1) {
      req._ftsReindexLimit = reindexLimit
    }
    if (reindexChunk) {
      req._ftsReindexChunk = reindexChunk
    }
  } else {
    console.error('Invalid command line cfg. See `>UB cmd/ftsReindex -help` for details')
  }

  try {
    console.time('Reindex time')
    conn.query(req)
    console.timeEnd('Reindex time')
  } finally {
    if (session && session.logout) {
      session.logout()
    }
  }
}
