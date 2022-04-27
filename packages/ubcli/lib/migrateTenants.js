/**
 * Apply models migrations for multitenant environments (excel DDL stage).
 * See [Version migrations tutorial](https://unitybase.info/api/server-v5/tutorial-migrations.html)
 * @module migrate
 * @memberOf module:@unitybase/ubcli
 */
const http = require('http')
const base = require('@unitybase/base')
const options = base.options
const argv = base.argv

const MIGR_FOLDER_NAME = '_migrate'

module.exports = function migrate (cfg) {
  if (!cfg) {
    const opts = options.describe('migrate',
      'Apply models migrations for application\nShould be executed from application folder',
      'ubcli'
    )
      .add(argv.establishConnectionFromCmdLineAttributes._cmdLineParams)
      .add({ short: 'optimistic', long: 'optimistic', defaultValue: false, help: 'skip errors on execute DDL statement. BE CAREFUL! DO NOT USE ON PRODUCTION' })
      .add({ short: 'v', long: 'verbose', defaultValue: false, searchInEnv: true, help: 'Verbose mode' })
      .add({
        short: 'vs',
        long: 'verboseShort',
        defaultValue: false,
        help: 'Short verbose mode (ins/upd only)'
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
  // increase receive timeout to 10 minutes - in case DB server is slow we can easy reach 30s timeout
  http.setGlobalConnectionDefaults({ receiveTimeout: 600000 })
  runMigrations(cfg)
}

/**
 *  @param {Object} params  Migration parameters
 *  @private
 */
function runMigrations (params) {
  const serverConfig = argv.getServerConfiguration(false)
  const multitenancyEnabled = serverConfig.security.multitenancy
    && serverConfig.security.multitenancy.enabled
  if (!multitenancyEnabled) {
    throw new Error('Command is intended for use in multitenant environments only')
  }

  const migrate = require('./migrate')

  const tenants = serverConfig.security.multitenancy.tenants
  const lastTenantID = tenants[tenants.length - 1].TID
  for (const t of tenants) {
    console.log('==========> Starting migration for tenant %s ...', t.TID)
    const migrateTenantOptions = Object.assign(
      {},
      params,
      {
        optimistic: false,
        noddl: true,
        noUpdateVersion: t.TID !== lastTenantID,
        tenantID: t.TID
      }
    )
    migrate(migrateTenantOptions)
    console.log('Migration data for tenant %s done.', t.TID)
  }
  console.info('Tenant data migration success')
}

module.exports.shortDoc = `Run ub-migrate + apply scripts from
\t\t\t'${MIGR_FOLDER_NAME}' models _migrate folders in a loop for all tenants`
