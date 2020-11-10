/**
 *  Apply models migrations for application. See []
 *
 * Usage from a command line:

 ubcli migrate -?

 * Usage from code:

 const migrate = require('@unitybase/ubcli/migrate')
 var options = {
          host: 'http://localhost:888',
          user: "admin",
          pwd:  "admin",
          out:  process.cwd(),
          autorun: true,
          optimistic: false
     }
 migrate(options)

 * @author pavel.mash
 * @module migrate
 * @memberOf module:@unitybase/ubcli
 */
const _ = require('lodash')
const fs = require('fs')
const path = require('path')
const http = require('http')
const base = require('@unitybase/base')
const options = base.options
const argv = base.argv
const execSql = require('./execSql')
const { createDBConnectionPool, releaseDBConnectionPool } = require('@unitybase/base')
const generateDDL = require('./generateDDL')
const { normalizeVersion, updateVersionsInDB } = require('./flow/migrationUtils')

/* global nhashFile */

const MIGR_FOLDER_NAME = '_migrate'
const HOOK_FILE_NAME = '_hooks.js'

module.exports = function migrate (cfg) {
  if (!cfg) {
    const opts = options.describe('migrate',
      'Apply models migrations for application\nShould be executed from application folder',
      'ubcli'
    )
      .add(argv.establishConnectionFromCmdLineAttributes._cmdLineParams)
      .add({ short: 'm', long: 'models', param: 'modelsList', defaultValue: '*', help: 'Comma separated model names for migration' })
      .add({ short: 'e', long: 'entities', param: 'entitiesList', defaultValue: '*', help: 'Comma separated entity names list for DDL generation' })
      .add({ short: 'c', long: 'connection', param: 'connection', defaultValue: '', help: 'Optional DB connection name for filter SQL migrations' })
      .add({ short: 'noddl', long: 'noddl', defaultValue: false, help: 'skip execution of generateDDL' })
      .add({ short: 'nodata', long: 'nodata', defaultValue: false, help: 'skip execution ub-migrate' })
      .add({ short: 'optimistic', long: 'optimistic', defaultValue: false, help: 'skip errors on execute DDL statement. BE CAREFUL! DO NOT USE ON PRODUCTION' })
      .add({ short: 'v', long: 'verbose', defaultValue: false, help: 'Verbose mode' })
    cfg = opts.parseVerbose({}, true)
    if (!cfg) return
  }
  cfg.user = 'root'
  // increase receive timeout to 10 minutes - in case DB server is slow we can easy reach 30s timeout
  http.setGlobalConnectionDefaults({ receiveTimeout: 600000 })
  runMigrations(cfg)
}

const BEFORE_DDL_RE = /_beforeDDL[_/.]/
const AFTER_DDL_RE = /_afterDDL[_/.]/
/**
 *  @param {Object} params  Migration parameters
 *  @private
 */
function runMigrations (params) {
  const serverConfig = argv.getServerConfiguration(false)
  let dbConnections = createDBConnectionPool(serverConfig.application.connections)

  let modelsToMigrate = serverConfig.application.domain.models
  if (params.models) { // migrate only specified models
    const inModels = params.models.split(',')
    modelsToMigrate = modelsToMigrate.filter(m => inModels.includes(m.name))
  }

  console.log('Loading application migration state...')
  let d = Date.now()
  const { dbVersions, dbVersionIDs, appliedScripts } = getMigrationState(dbConnections.DEFAULT, modelsToMigrate)
  console.log(`Migration state (${appliedScripts.length} applied scripts for ${Object.keys(dbVersions).length} models) is loaded from ub_migration table in ${Date.now() - d}ms`)
  // console.debug('DBVersions=', dbVersions)
  // console.debug('appliedScripts=', appliedScripts)

  d = Date.now()
  console.log(`Search for migration files in models ${MIGR_FOLDER_NAME} folders..`)
  const migrations = readMigrations(modelsToMigrate)
  const totalFiles = migrations.files.length
  console.log(`Found ${totalFiles} migration file(s) in ${Date.now() - d}ms`)

  // remove already applied files and verify files SHA
  let shaIsEqual = true
  migrations.files = migrations.files.filter(f => {
    const applied = appliedScripts.find(s => (s.modelName === f.model) && (s.filePath === f.name))
    if (applied && applied.fileSha !== f.sha) {
      shaIsEqual = false
      console.error(`File checksum for '${f.name}' in model '${f.model}' is '${f.sha}' but in database is '${applied.fileSha}'`)
    }
    return !applied
  })
  if (!shaIsEqual) {
    throw new Error('Some files are modified after been applied. Migration terminated')
  }
  console.log(`${migrations.files.length} migration files is new and will be applied`)

  // generateDDL stage
  /** @type ServerSession */
  let session
  /** @type SyncConnection */
  let conn

  if (!params.noddl) {
    // apply beforeGenerateDDL hooks
    migrations.hooks.forEach(h => {
      if (typeof h.hook.beforeGenerateDDL === 'function') {
        if (params.verbose) console.log(`Call beforeGenerateDDL hook for model '${h.model}'`)
        h.hook.beforeGenerateDDL({ conn: null, dbConnections, dbVersions, migrations })
      }
    })

    // apply file based before DDL hooks
    const beforeDDLFiles = migrations.files.filter(f => BEFORE_DDL_RE.test(f.name))
    if (params.verbose && beforeDDLFiles.length) console.log('Run beforeDDL hooks:', beforeDDLFiles)
    runFiles(beforeDDLFiles, params, { conn: null, dbConnections, dbVersions, migrations })

    // run DDL generator
    const paramsForDDL = Object.assign({}, params)
    paramsForDDL.autorun = true // force autorun
    paramsForDDL.out = process.cwd() // save script into current folder
    paramsForDDL.forceStartServer = true // use a local server instance
    releaseDBConnectionPool() // release DB pool created by controller

    if (params.verbose) console.log('Run generateDDL with params:', paramsForDDL)
    generateDDL(paramsForDDL)

    // after generateDDL we can connect to UB server
    session = argv.establishConnectionFromCmdLineAttributes(params)
    conn = session.connection
    // recreate DB pool - will use server pool (server is started on this stage)
    dbConnections = createDBConnectionPool(serverConfig.application.connections)

    // apply afterGenerateDDL hooks
    migrations.hooks.forEach(h => {
      if (typeof h.hook.afterGenerateDDL === 'function') {
        if (params.verbose) console.log(`Call afterGenerateDDL hook for model '${h.model}'`)
        h.hook.afterGenerateDDL({ conn, dbConnections, dbVersions, migrations })
      }
    })

    // apply file based before DDL hooks
    const afterDDLFiles = migrations.files.filter(f => AFTER_DDL_RE.test(f.name))
    if (params.verbose && afterDDLFiles.length) console.log('Run afterDDL hooks:', afterDDLFiles)
    runFiles(afterDDLFiles, params, { conn, dbConnections, dbVersions, migrations })
  } else {
    if (params.verbose) console.log('Skip generateDDL stage')
    releaseDBConnectionPool() // release DB pool created by controller
    session = argv.establishConnectionFromCmdLineAttributes(params)
    dbConnections = createDBConnectionPool(serverConfig.application.connections)
    conn = session.connection
  }

  // remove before/after DDL hook files - either already applied or should be skipped
  migrations.files = migrations.files.filter(f => !BEFORE_DDL_RE.test(f.name) && !AFTER_DDL_RE.test(f.name))

  // apply ub-migrate if installed
  if (!params.nodata) {
    const ubMigratePath = require.resolve('@unitybase/ub-migrate')
    if (!ubMigratePath) {
      console.warn('Skipped data sync because ub-migrate not found. Either add -nodata parameter or install a ub-migrate (npm i @unitybase/ub-migrate)')
    } else {
      const ubMigrate = require('@unitybase/ub-migrate')
      if (typeof ubMigrate.exec !== 'function') {
        console.warn('Skipped data sync because ub-migrate is outdated (require to be >= 5.17.0). Either add -nodata parameter or update a ub-migrate (npm update @unitybase/ub-migrate)')
      } else {
        const paramsForUbMigrate = Object.assign({}, params)
        paramsForUbMigrate.silent = true
        // paramsForUbMigrate.verbose = false
        console.log('Run ub-migrate with parameters:', JSON.stringify(paramsForUbMigrate))
        debugger
        ubMigrate.exec(paramsForUbMigrate)
      }
    }
  } else if (params.verbose) {
    console.log('Skip data sync (ub-migrate) stage')
  }

  // call filterFiles hooks in reverse order
  // apply afterGenerateDDL hooks
  const initialFilesCnt = migrations.files.length
  for (let i = migrations.hooks.length - 1; i >= 0; i--) {
    if (typeof migrations.hooks[i].hook.filterFiles === 'function') {
      if (params.verbose) console.log(`Call filterFiles hook for model '${migrations.hooks[i].model}'`)
      migrations.hooks[i].hook.filterFiles({ conn, dbConnections, dbVersions, migrations })
    }
  }
  if (params.verbose) console.log(`filterFiles hooks decline ${initialFilesCnt - migrations.files.length} files`)

  runFiles(migrations.files, params, { conn, dbConnections, dbVersions, migrations })

  // apply finalize hooks
  migrations.hooks.forEach(h => {
    if (typeof h.hook.finalize === 'function') {
      if (params.verbose) console.log(`Call finalize hook for model '${h.model}'`)
      h.hook.finalize({ conn, dbConnections, dbVersions, migrations: migrations })
    }
  })

  updateVersionsInDB(conn, modelsToMigrate, { dbVersionIDs, dbVersions })

  console.info('Migration success')
}

/**
 * Run filesToRun
 */
function runFiles (filesToRun, params, { conn, dbConnections, dbVersions, migrations }) {
  // execute filesToRun
  filesToRun.forEach(f => {
    if (f.name.endsWith('.js')) {
      const jsMigrationModule = require(f.fullPath)
      if (typeof jsMigrationModule !== 'function') {
        console.error(`File '${f.name}' in model '${f.model}' do not exports a function. Skipped`)
      } else {
        jsMigrationModule({ conn, dbConnections, dbVersions, migrations })
      }
    } else if (f.name.endsWith('.sql')) {
      const parts = /#(.*?)[\-.#/]/.exec(f.name) // 010#rrpUb#fix-UBJS-1223.sql -> ["#rrpUb#", "rrpUb"]
      let connName
      if (parts && parts[1]) {
        if (!dbConnections[parts[1]]) {
          throw new Error(`Unknown connection '${parts[1]}' (text between ##): file '${f.name}' in model '${f.model}'`)
        }
        connName = parts[1]
      }
      execSql({
        connection: connName,
        file: f.fullPath,
        optimistic: params.optimistic
      })
    } else {
      console.warn(`Unknown extension for '${f.name}' in model '${f.model}'`)
    }

    // conn.insert cant be used because in beforeDDL hook conn is not defined
    dbConnections.DEFAULT.exec('insert into ub_migration(ID, modelName, filePath, fileSha) VALUES(?, ?, ?, ?)',
      [dbConnections.DEFAULT.genID(undefined), f.model, f.name, f.sha])
    dbConnections.DEFAULT.commit()
    // conn.insert({
    //   entity: 'ub_migration',
    //   method: 'insert',
    //   execParams: {
    //     ID:
    //     modelName: f.model,
    //     filePath: f.name,
    //     fileSha: f.sha
    //   }
    // })
  })
}
/**
 * Read ub_version and ub_migration from database. Return `000000000` for model versions what not exists in ub_version
 * @param {DBConnection} dbConn
 * @param {Object} modelsConfig
 * @return {{dbVersions: Object<string, string>, appliedScripts: Array<{modelName: string, filePath: string, fileSha: string}>}}
 */
function getMigrationState (dbConn, modelsConfig) {
  const r = {
    dbVersions: {},
    dbVersionIDs: {},
    appliedScripts: []
  }
  try {
    const versions = dbConn.selectParsedAsObject('select ID, modelName AS "modelName", version as "version" from ub_version')
    versions.forEach(v => {
      r.dbVersions[v.modelName] = v.version
      r.dbVersionIDs[v.modelName] = v.ID
    })
  } catch (e) {
    // table not exists
  }
  // add models not in DB but in current config with 0 version
  modelsConfig.forEach(m => {
    if (!r.dbVersions[m.name]) {
      r.dbVersions[m.name] = normalizeVersion()
    }
  })
  // add application version if missed
  if (!r.dbVersions.APPLICATION) r.dbVersions.APPLICATION = normalizeVersion()

  try {
    r.appliedScripts = dbConn.selectParsedAsObject('select modelName AS "modelName", filePath as "filePath", fileSha as "fileSha" from ub_migration')
  } catch (e) {
    // table not exists
  }
  return r
}

/**
 * Load content of all `_migrate` model sub-folders.
 * Files inside migrations already sorter in order for execution
 * @param {Array<Object>} models
 * @return {{hooks: Array<{model: string, hook: Object<string, function>}>, files: Array<{model: string, name: string, fullPath: string, sha: string}>}}
 */
function readMigrations (models) {
  const migrations = {
    hooks: [],
    files: []
  }
  models.forEach(m => {
    const mp = path.join(m.realPath, MIGR_FOLDER_NAME)
    if (!fs.existsSync(mp)) return // no migrations for model
    if (!fs.statSync(mp).isDirectory()) {
      console.error(`'${mp}' is a file, but should be a folder`)
      return
    }
    const files = fs.readdirSync(mp).filter(f => !f.startsWith('_')).sort()
    files.forEach(f => {
      const ffp = path.join(mp, f)
      if (fs.isFile(ffp)) {
        migrations.files.push({
          model: m.name,
          name: f,
          fullPath: ffp,
          sha: nhashFile(ffp, 'SHA256')
        })
      } else { // folder
        const fFiles = fs.readdirSync(ffp).filter(f => !f.startsWith('_')).sort()
        fFiles.forEach(ff => {
          const subPath = path.join(ffp, ff)
          if (fs.isFile(subPath)) {
            migrations.files.push({
              model: m.name,
              name: f + '/' + ff, // folder/file
              fullPath: subPath,
              sha: nhashFile(subPath, 'SHA256')
            })
          } else {
            console.warn(`${MIGR_FOLDER_NAME} folder should have 1 level depth. Sub-folder '${subPath}' is ignored`)
          }
        })
      }
    })
    // check for hooks
    const hookFn = path.join(mp, HOOK_FILE_NAME)
    if (fs.existsSync(hookFn)) {
      migrations.hooks.push({
        model: m.name,
        hook: require(hookFn)
      })
    }
  })
  return migrations
}

module.exports.shortDoc = `Run generateDDL + ub-migrate + apply scripts from
\t\t\t'${MIGR_FOLDER_NAME}' models folders`
