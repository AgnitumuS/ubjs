/**
 * Execute an SQL script in specified connection.
 * Statements in script can be delimited using a line what contains only one of:
 *   - `--`
 *   - `/`
 *   - `GO`
 * Each statement is executed in own transaction.
 *
 * If --optimistic (-o) option is passed each statement are wrapped in try/finally block and script execution will continue even after error in individual statement
 *
 * Exceptions in statements what contains `-- ignore error` string are ignored
 *
 * Usage from a command line:

 ubcli execSsq -?
 ubcli execSql -c connectionName -f path/to/script.sql -o

 * Usage from a code:
 *
 const execSql = require('@unitybase/ubcli/lib/execSql')
 let options = {
      connection: 'main',
      file: './myScript.sql',
      optimistic: true,
      progress: false
  }
 execSql(options)

 * @module execSql
 * @memberOf module:@unitybase/ubcli
 */

const options = require('@unitybase/base').options
const argv = require('@unitybase/base').argv
const fs = require('fs')
const _ = require('lodash')
const createDBConnectionPool = require('@unitybase/base').createDBConnectionPool

module.exports = execSql

let dbConnections

/**
 * @param {Object} cfg
 * @param {string} [cfg.connection]        Connection name. If empty - uses default connection
 * @param {string} cfg.file                Path to a script for execution
 * @param {Boolean} [cfg.optimistic=false] Wrap each statement in try/catch block. Continue execution on exceptions
 * @param {Boolean} [cfg.progress=false]   Output execution time for each command into console
 */
function execSql (cfg) {
  if (!cfg) {
    const opts = options.describe('initDB',
      'Execute an SQL script in specified connection.\nEach statment executed in separate transaction', 'ubcli')
      .add([
        { short: 'c', long: 'connection', param: 'connectionName', defaultValue: '', searchInEnv: true, help: 'Connection name. If empty - uses default connection' },
        { short: 'f', long: 'file', param: '/path/to/script.sql', searchInEnv: false, help: 'Path to a script for execution' }
      ])
      .add({
        short: 'o',
        long: 'optimistic',
        defaultValue: false,
        searchInEnv: false,
        help: 'Wrap each statement in try/catch block\n\t\tContinue execution on exceptions'
      })
      .add({
        short: 'p',
        long: 'progress',
        defaultValue: false,
        searchInEnv: true,
        help: 'Output execution time for each command into console'
      })
    cfg = opts.parseVerbose({}, true)
  }
  if (!cfg) return
  const config = argv.getServerConfiguration(true)

  let connDef
  if (cfg.connection) {
    connDef = config.application.connections.find(c => c.name === cfg.connection)
    if (!connDef) throw new Error(`Database connection with name '@${cfg.connection}' not found in application.connections`)
  } else {
    connDef = config.application.connections.find(c => c.isDefault === true)
    if (!connDef) throw new Error('Connection with isDefault=true not found in application.connections')
  }

  if (!dbConnections) {
    dbConnections = createDBConnectionPool(config.application.connections)
  }
  let script = fs.readFileSync(cfg.file, { encoding: 'utf8' })
  script = script.replace(/\r\n/g, '\n')
  const stmts = script.split(/^[ \t]*--[ \t]*$|^[ \t]*GO[ \t]*$|^[ \t]*\/[ \t]*$/gm).filter(s => s.trim() !== '')
  const dbConn = dbConnections[connDef.name]
  console.log(`Executing script '${cfg.file}' using connection '${connDef.name}' (${stmts.length} statements)...`)
  const totalT = Date.now()
  let invalidStmtCnt = 0
  let successStmtCnt = 0
  let ignoreErr = false
  stmts.forEach((stmt, n) => {
    try {
      const d = Date.now()
      ignoreErr = stmt.indexOf('-- ignore error') > -1
      dbConn.execParsed(stmt)
      dbConn.commit()
      if (cfg.progress) {
        console.log(`#${n + 1}: ${Date.now() - d}ms`)
      }
      successStmtCnt++
    } catch (e) {
      invalidStmtCnt++
      if (!cfg.optimistic && !ignoreErr) throw e
    }
  })
  if (invalidStmtCnt > 0) {
    console.warn(`Script completed ${successStmtCnt} statement success and ${invalidStmtCnt} statements with exceptions (ignored in optimistic mode)`)
  } else {
    console.info(`Successfully completed ${successStmtCnt} statements`)
  }
  console.log(`Total execution time: ${Date.now() - totalT}ms`)
}

module.exports.shortDoc = 'Execute an SQL script in specified connection'
