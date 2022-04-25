/**
 *  Apply models migrations for application. See [Version migrations tutorial](https://unitybase.info/api/server-v5/tutorial-migrations.html)
 *
 * Usage from the command line:

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
      .add({ short: 'ddlfor', long: 'ddlfor', param: 'ddlfor', defaultValue: '*', help: 'comma separated model names for DDL generator' })
      .add({ short: 'nodata', long: 'nodata', defaultValue: false, help: 'skip execution ub-migrate' })
      .add({
        short: 'nover',
        long: 'noUpdateVersion',
        defaultValue: false,
        help: 'skip update versions of models'
      })
      .add({
        short: 'noscripts',
        long: 'noMigrationScripts',
        defaultValue: false,
        help: 'skip executing migration scripts'
      })
      .add({ short: 'optimistic', long: 'optimistic', defaultValue: false, help: 'skip errors on execute DDL statement. BE CAREFUL! DO NOT USE ON PRODUCTION' })
      .add({ short: 'v', long: 'verbose', defaultValue: false, searchInEnv: true, help: 'Verbose mode' })
      .add({
        short: 'vs',
        long: 'verboseShort',
        defaultValue: false,
        help: 'Short verbose mode (ins/upd only)'
      })
      .add({
        short: 'tid',
        long: 'tenantID',
        defaultValue: NaN,
        param: 'tenantID',
        help: 'Tenant ID to initialize.  If not specified, all tenants will be iterated.'
      })
      .add({
        short: 'p',
        long: 'progress',
        defaultValue: false,
        searchInEnv: true,
        help: 'Output execution time for each command into console'
      })
    cfg = opts.parseVerbose({}, true)
    if (cfg.verbose) cfg.verboseShort = true
    if (!cfg) return
  }
  cfg.user = 'root'
  // increase receive timeout to 10 minutes - in case DB server is slow we can easily reach 30s timeout
  http.setGlobalConnectionDefaults({ receiveTimeout: 600000 })
  runMigrations(cfg)
}

const BEFORE_DDL_RE = /_beforeDDL[_/.]/
const BEFORE_DDL_C_RE = /_beforeDDLc[_/.]/
const AFTER_DDL_RE = /_afterDDL[_/.]/
const IS_VERSION_RE = /^\d{9}$/ // 9 digits version number 005001001
const NORMALIZE_VERSION_RE = /^((\d{1,3})[._](\d{1,3})[._](\d{1,3}))/

/**
 *  @param {Object} params  Migration parameters
 *  @private
 */
function runMigrations (params) {
  const serverConfig = argv.getServerConfiguration(false)
  let dbConnections = createDBConnectionPool(serverConfig.application.connections)
  const multitenancyEnabled = serverConfig.security.multitenancy
    && serverConfig.security.multitenancy.enabled

  let modelsToMigrate = serverConfig.application.domain.models
  if (params.models) { // migrate only specified models
    const inModels = params.models.split(',')
    modelsToMigrate = modelsToMigrate.filter(m => inModels.includes(m.name))
  }

  console.log('Loading application migration state from DB...')
  // allows beforeDDL script to be added into ub_migration table
  createUbMigrateIfNotExists(dbConnections.DEFAULT, multitenancyEnabled)
  let d = Date.now()
  if (params.tenantID) {
    dbConnections.DEFAULT.exec('SET ub.tenantID=' + params.tenantID)
  }
  const { dbVersions, dbVersionIDs, appliedScripts } = getMigrationState(dbConnections.DEFAULT, modelsToMigrate)
  console.log(`Migration state (${appliedScripts.length} applied scripts for ${Object.keys(dbVersions).length} models) is loaded from ub_migration table in ${Date.now() - d}ms`)
  // console.debug('DBVersions=', dbVersions)
  // console.debug('appliedScripts=', appliedScripts)

  d = Date.now()
  console.log(`Search for migration files in models ${MIGR_FOLDER_NAME} folders..`)
  const migrations = readMigrations(modelsToMigrate)
  const totalFiles = migrations.files.length
  console.log(`Found ${totalFiles} migration file(s) in ${Date.now() - d}ms`)

  // remove files for model versions prior to dbVersions
  // for "fresh" setup, `ubcli initialize` fills ub_version table by models versions on the moment
  // of the initialization
  let oldFilesSkipped = 0
  migrations.files = migrations.files.filter(f => {
    const fileModelVersion = f.name.substring(0, 9)
    if (IS_VERSION_RE.test(fileModelVersion)) {
      // file name should start from 9 digits model version to which it migrates
      // - files intended for migrate to model versions prior to current DB state are skipped
      // - starting from 2021-11-17 files for current model version are NOT skipped (< instead of <=)
      //   this allows to add a new migration script and apply migration for current version many times
      //   **WARNING** - do not modify an existed and already applied migration scripts - instead either create a new one
      //   or rename existed script (if it supports re-execution) and change renamed one.
      if (fileModelVersion < dbVersions[f.model]) {
        oldFilesSkipped++
        return false
      }
    }
    return true // apply files what ot starts from 9 digits or intended for migrate to version newer than current
  })
  if (oldFilesSkipped) {
    console.log(`${oldFilesSkipped} files intended for migrate to the version of model prior to currently applied are skipped`)
  }

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
  console.log(`${migrations.files.length} migration files are new and will be applied`)

  // generateDDL stage
  /** @type ServerSession */
  let session
  /** @type SyncConnection */
  let conn

  if (!params.noddl) {
    // apply beforeGenerateDDL hooks
    migrations.hooks.forEach(h => {
      if (typeof h.hook.beforeGenerateDDL === 'function') {
        if (params.verboseShort) console.log(`Call beforeGenerateDDL hook for model '${h.model}'`)
        h.hook.beforeGenerateDDL({ conn: null, dbConnections, dbVersions, migrations })
      }
    })

    // apply file based before DDL hooks
    const beforeDDLFiles = migrations.files.filter(f => BEFORE_DDL_RE.test(f.name))
    if (params.verboseShort && beforeDDLFiles.length) console.log('Run beforeDDL hooks:', beforeDDLFiles)
    runFiles(beforeDDLFiles, params, { conn: null, dbConnections, dbVersions, migrations })
    releaseDBConnectionPool() // release DB pool created by controller

    // connect to server to allows _beforeDDLc_ hooks
    session = argv.establishConnectionFromCmdLineAttributes(params)
    conn = session.connection
    // recreate DB pool - will use server pool (server is started on this stage)
    dbConnections = createDBConnectionPool(serverConfig.application.connections)

    // apply beforeDDL then connected (beforeDDLc) hooks
    migrations.hooks.forEach(h => {
      if (typeof h.hook.beforeGenerateDDLc === 'function') {
        if (params.verboseShort) console.log(`Call beforeGenerateDDL hook for model '${h.model}'`)
        h.hook.beforeGenerateDDLc({ conn, dbConnections, dbVersions, migrations })
      }
    })
    // apply file based before DDL when connected hooks
    const beforeDDLFilesC = migrations.files.filter(f => BEFORE_DDL_C_RE.test(f.name))
    if (params.verboseShort && beforeDDLFilesC.length) console.log('Run beforeDDL when connected hooks:', beforeDDLFilesC)
    runFiles(beforeDDLFilesC, params, { conn, dbConnections, dbVersions, migrations })

    // run DDL generator
    const paramsForDDL = Object.assign({}, params)
    paramsForDDL.autorun = true // force autorun
    paramsForDDL.out = process.cwd() // save script into current folder
    paramsForDDL.forceStartServer = true // use a local server instance
    if (params.ddlfor && (params.ddlfor !== '*')) {
      paramsForDDL.models = params.ddlfor
    }
    if (params.verboseShort) console.log('Run generateDDL with params:', paramsForDDL)
    generateDDL(paramsForDDL)

    // apply afterGenerateDDL hooks
    migrations.hooks.forEach(h => {
      if (typeof h.hook.afterGenerateDDL === 'function') {
        if (params.verboseShort) console.log(`Call afterGenerateDDL hook for model '${h.model}'`)
        h.hook.afterGenerateDDL({ conn, dbConnections, dbVersions, migrations })
      }
    })

    // apply file based before DDL hooks
    const afterDDLFiles = migrations.files.filter(f => AFTER_DDL_RE.test(f.name))
    if (params.verboseShort && afterDDLFiles.length) console.log('Run afterDDL hooks:', afterDDLFiles)
    runFiles(afterDDLFiles, params, { conn, dbConnections, dbVersions, migrations })
  } else {
    if (params.verboseShort) console.warn('Skip generateDDL stage (-noddl)')
    releaseDBConnectionPool() // release DB pool created by controller
    session = argv.establishConnectionFromCmdLineAttributes(params)
    dbConnections = createDBConnectionPool(serverConfig.application.connections)
    conn = session.connection
  }

  // remove before/after DDL hook files - either already applied or should be skipped
  migrations.files = migrations.files.filter(f => !BEFORE_DDL_RE.test(f.name) &&
    !AFTER_DDL_RE.test(f.name) && !BEFORE_DDL_C_RE.test(f.name))

  // apply ub-migrate if installed
  if (!params.nodata) {
    const ubMigratePath = require.resolve('@unitybase/ub-migrate')
    if (!ubMigratePath) {
      console.warn('Skipped data sync because ub-migrate not found. Either add -nodata parameter or install ub-migrate (npm i @unitybase/ub-migrate)')
    } else {
      const ubMigrate = require('@unitybase/ub-migrate')
      if (typeof ubMigrate.exec !== 'function') {
        console.warn('Skipped data sync because ub-migrate is outdated (require to be >= 5.17.0). Either add -nodata parameter or update ub-migrate (npm update @unitybase/ub-migrate)')
      } else {
        const paramsForUbMigrate = Object.assign({}, params)
        paramsForUbMigrate.silent = true
        // paramsForUbMigrate.verbose = false
        console.log('Run ub-migrate with parameters:', JSON.stringify(paramsForUbMigrate))
        ubMigrate.exec(paramsForUbMigrate)
      }
    }
  } else if (params.verboseShort) {
    console.warn('Skip data sync (ub-migrate) stage (-nodata)')
  }

  if (!params.noMigrationScripts) {
    // call filterFiles hooks in reverse order
    const initialFilesCnt = migrations.files.length
    for (let i = migrations.hooks.length - 1; i >= 0; i--) {
      if (typeof migrations.hooks[i].hook.filterFiles === 'function') {
        if (params.verbose) console.log(`Call filterFiles hook for model '${migrations.hooks[i].model}'`)
        migrations.hooks[i].hook.filterFiles({ conn, dbConnections, dbVersions, migrations })
      }
    }
    if (params.verbose) console.log(`filterFiles hooks decline ${initialFilesCnt - migrations.files.length} files`)

    // apply remains migration files (without beforeDDL* hooks)
    runFiles(migrations.files, params, { conn, dbConnections, dbVersions, migrations })

    // apply finalizing hooks
    migrations.hooks.forEach(h => {
      if (typeof h.hook.finalize === 'function') {
        if (params.verbose) console.log(`Call finalize hook for model '${h.model}'`)
        h.hook.finalize({ conn, dbConnections, dbVersions, migrations: migrations })
      }
    })
  } else {
    console.log('Migration scripts skipped because of "noMigrationScripts" option')
  }

  if (!params.noUpdateVersion) {
    updateVersionsInDB(conn, modelsToMigrate, { dbVersionIDs, dbVersions })
  } else {
    console.log('Skipped update version because of "noUpdateVersion" flag')
  }

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
        console.error(`File '${f.origName}' in model '${f.model}' do not export a function. Skipped`)
      } else {
        jsMigrationModule({ conn, dbConnections, dbVersions, migrations })
      }
    } else if (f.name.endsWith('.sql')) {
      const parts = /#(.*?)[-.#/]/.exec(f.name) // 010#rrpUb#fix-UBJS-1223.sql -> ["#rrpUb#", "rrpUb"]
      let connName
      if (parts && parts[1]) {
        if (!dbConnections[parts[1]]) {
          throw new Error(`Unknown connection '${parts[1]}' (text between ##): file '${f.origName}' in model '${f.model}'`)
        }
        connName = parts[1]
      }
      execSql({
        connection: connName,
        file: f.fullPath,
        optimistic: params.optimistic,
        verbose: params.verbose,
        progress: params.progress
      })
    } else {
      console.warn(`Unknown extension for '${f.origName}' in model '${f.model}'`)
    }

    // conn.insert cannot be used because in beforeDDL hook conn is not defined
    if (params.tenantID) {
      dbConnections.DEFAULT.exec('SET ub.tenantID=' + params.tenantID)
      dbConnections.DEFAULT.exec(
        'insert into ub_migration(ID, modelName, filePath, fileSha, mi_tenantID) VALUES(?, ?, ?, ?, ?)',
        [dbConnections.DEFAULT.genID(undefined), f.model, f.name, f.sha, params.tenantID]
      )
    } else {
      dbConnections.DEFAULT.exec(
        'insert into ub_migration(ID, modelName, filePath, fileSha) VALUES(?, ?, ?, ?)',
        [dbConnections.DEFAULT.genID(undefined), f.model, f.name, f.sha]
      )
    }
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
 * Create ub_migration table if it does not exist
 * @param {DBConnection} dbConn
 * @param {boolean} multitenancyEnabled
 */
function createUbMigrateIfNotExists (dbConn, multitenancyEnabled) {
  let exists = null
  try {
    // fake select to ensure table exists
    exists = dbConn.selectParsedAsObject('select modelName AS "modelName", filePath as "filePath", fileSha as "fileSha" from ub_migration where ID=0')
  } catch (e) {
    // table not exists
  }
  if (!exists) {
    const ubMigrateTableScript = path.join(__dirname, 'dbScripts', 'create_ub_migrate.sql')
    execSql({
      file: ubMigrateTableScript,
      optimistic: true,
      multitenancyEnabled
    })
  }
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
    const versions = dbConn.selectParsedAsObject('select ID as "ID", modelName AS "modelName", version as "version" from ub_version')
    versions.forEach(v => {
      if (!r.dbVersions[v.modelName] || v.version > r.dbVersions[v.modelName]) { // old version of ub_migrate can produce several rows for same model - take the latest
        r.dbVersions[v.modelName] = v.version
      }
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
    const files = fs.readdirSync(mp).filter(f => !f.startsWith('_'))
      .map(f => {
        return { fn: f, normalizedFn: normalizeVersionInFileName(f) }
      }).sort( // sort files by normalized 9digits version number
        (a, b) => a.normalizedFn.localeCompare(b.normalizedFn)
      )
    files.forEach(f => {
      const ffp = path.join(mp, f.fn)
      if (fs.isFile(ffp)) {
        migrations.files.push({
          model: m.name,
          name: f.normalizedFn,
          origName: f.fn,
          fullPath: ffp,
          sha: nhashFile(ffp, 'SHA256')
        })
      } else { // folder
        const fFiles = fs.readdirSync(ffp).filter(subFolderF => !subFolderF.startsWith('_')).sort()
        fFiles.forEach(ff => {
          const subPath = path.join(ffp, ff)
          if (fs.isFile(subPath)) {
            migrations.files.push({
              model: m.name,
              name: f.normalizedFn + '/' + ff, // normalized folder/file
              origName: f.fn + '/' + ff, // original folder/file
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

/**
 * Normalize beginning of the string to match XXXYYYZZZ version pattern
 *   - '2.13.21*' -> '002013021*'
 *   - '02_1_1*' -> '002001001*'
 *   - 'notA3digitsGroup' -> 'notA3digitsGroup'
 * @param {string} fn
 * @returns {string}
 */
function normalizeVersionInFileName (fn) {
  // '2.3.12-asdsa' ->  ["2.3.12", "2.3.12", "2", "3", "12"]
  const p = NORMALIZE_VERSION_RE.exec(fn)
  if (p === null) return fn // not match 3digits pattern
  const tail = fn.substring(p[0].length)
  return `${p[2].padStart(3, '0')}${p[3].padStart(3, '0')}${p[4].padStart(3, '0')}${tail}`
}

module.exports.shortDoc = `Run generateDDL + ub-migrate + apply scripts from
\t\t\t'${MIGR_FOLDER_NAME}' models _migrate folders`
