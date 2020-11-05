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

 // exec SQL script in default connection
 options = {
      sql: `BEGIN'
      import_users.do_import;
      END;
      /
      delete from myTable where code = 'oldCode';`
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
 * @param {string} [cfg.file]              Path to a script for execution. Either file or sql should be specified
 * @param {string} [cfg.sql]               Text of SQL script for execution. Either file or sql should be specified
 * @param {Boolean} [cfg.optimistic=false] Wrap each statement in try/catch block. Continue execution on exceptions
 * @param {Boolean} [cfg.progress=false]   Output execution time for each command into console
 */
function execSql (cfg) {
  if (!cfg) {
    const opts = options.describe('initDB',
      'Execute an SQL script in specified connection.\nEach statment executed in separate transaction', 'ubcli')
      .add([
        { short: 'c', long: 'connection', param: 'connectionName', defaultValue: '', searchInEnv: true, help: 'Connection name. If empty - uses default connection' },
        { short: 'f', long: 'file', param: '/path/to/script.sql', defaultValue: '', searchInEnv: false, help: 'Path to a script for execution. Either -f or -sql should be specified' },
        { short: 'sql', long: 'sql', param: 'sql text for execution', defaultValue: '', searchInEnv: false, help: 'text of SQL script for execution. Either -f or -sql should be specified' }
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

  let connCfg
  if (cfg.connection) {
    connCfg = config.application.connections.find(c => c.name === cfg.connection)
    if (!connCfg) throw new Error(`Database connection with name '@${cfg.connection}' not found in application.connections`)
  } else {
    connCfg = config.application.connections.find(c => c.isDefault === true)
    if (!connCfg) throw new Error('Connection with isDefault=true not found in application.connections')
  }

  if (!dbConnections) {
    dbConnections = createDBConnectionPool(config.application.connections)
  }
  let script
  if (cfg.file) {
    script = fs.readFileSync(cfg.file, { encoding: 'utf8' })
  } else if (cfg.sql) {
    script = cfg.sql
  } else {
    throw new Error('Either file or sql MUST be specified')
  }

  script = script.replace(/\r\n/g, '\n')
  const stmts = script.split(/^[ \t]*--[ \t]*$|^[ \t]*GO[ \t]*$|^[ \t]*\/[ \t]*$/gm).filter(s => s.trim() !== '')
  const dbConn = dbConnections[connCfg.name]
  console.log(`Executing script '${cfg.file}' using connection '${connCfg.name}' (${stmts.length} statements)...`)
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
