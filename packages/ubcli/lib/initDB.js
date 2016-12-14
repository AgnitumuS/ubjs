/**
 * Create a database (schema) & a minimal set of DB object for a UnityBase ORM
 * Will first create a temporary config with authentication disabled and
 * @example
 *
     //from a command line
     >ub cmd/initDB -u admin -p admin -dba postgres -dbaPwd postgreDBAPassword

     //from a code
     var initDB = require('@unitybase/ubcli/initDB');
     var options = {
        "host": "http://localhost:888",
        "user": "admin",
        "pwd": "admin",
        "clientIdentifier": 3,
        "dropDatabase": true,
        "createDatabase": true,
        "dba": "postgres",
        "dbaPwd": "postgreDBAPassword"
    };
    initDB(options);

 * @module @unitybase/ubcli/initDB
 */

const {options, argv} = require('@unitybase/base')
const UBA_COMMON = require('@unitybase/uba/modules/uba_common')
const _ = require('lodash')
const fs = require('fs')
const http = require('http')

/**
 * If DBA already create a database for you set both `dropDatabase` & `createDatabase` to false
 * @param {Object} cfg
 * @param {Number} [cfg.clientIdentifier=3] Identifier of the client.
 *    Must be between 2 and 8999. Number 1 is for UnityBase developer, 3 for test.
 *    Numbers > 100 is for real installations
 * @param {Boolean} [cfg.dropDatabase=false] Drop a database/schema first
 * @param {Boolean} [cfg.createDatabase=false] Create a new database/schema.
 * @param {String} [cfg.dba] A DBA name. Used in case `createDatabase=true`
 * @param {String} [cfg.dbaPwd] A DBA password. Used in case `createDatabase=true`
 */
module.exports = function initDB (cfg) {
  if (!cfg) {
    var opts = options.describe('initDB', 'Prepare a new database for a UB ORM', 'ubcli')
          .add(argv.establishConnectionFromCmdLineAttributes._cmdLineParams)
          .add({short: 'c', long: 'clientIdentifier', param: 'clientIdentifier', defaultValue: 3, searchInEnv: false, help: 'Identifier of the client'})
          .add({short: 'drop', long: 'dropDatabase', param: '', defaultValue: false, searchInEnv: false, help: 'Drop a database/schema first'})
          .add({short: 'create', long: 'createDatabase', param: '', defaultValue: false, searchInEnv: false, help: 'Create a new database/schema'})
          .add({short: 'dba', long: 'dba', param: 'DBA_user_name', defaultValue: '', searchInEnv: false, help: 'A DBA name. Used in case `createDatabase=true`'})
          .add({short: 'dbaPwd', long: 'dbaPwd', param: 'DBA_password', defaultValue: '', searchInEnv: false, help: 'A DBA password. Used in case `createDatabase=true`'})
    cfg = opts.parseVerbose({}, true)
  }
  if (!cfg) return
  var session, conn, defaultDB, generator

  var originalConfigFileName = argv.getConfigFileName()
  var config = argv.getServerConfiguration()
  cfg.host = argv.serverURLFromConfig(config)

    // database are slow :( Increase timeout to 2 minutes
  http.setGlobalConnectionDefaults({receiveTimeout: 2 * 60 * 1000})

  if (argv.checkServerStarted(cfg.host)) {
    //    throw new Error('Please, shutdown a server on ' + cfg.host + ' before run this command');
  }

  fs.renameSync(originalConfigFileName, originalConfigFileName + '.bak')
  try {
    defaultDB = createFakeConfig(config, originalConfigFileName)
    cfg.forceStartServer = true
    session = argv.establishConnectionFromCmdLineAttributes(cfg)
    conn = session.connection
    var dbDriverName = defaultDB.driver.toLowerCase()
    if (dbDriverName.startsWith('mssql')) {
      dbDriverName = 'mssql'
    }
    generator = require(`./dbScripts/${dbDriverName}`)
    if (cfg.dropDatabase) {
      console.info('Dropping a database...')
      generator.dropDatabase(session, defaultDB)
    }
    if (cfg.createDatabase) {
      console.info('Creating a database...')
      generator.createDatabase(conn, defaultDB)
    }
    console.info('Creating a minimal set of database objects...')
    generator.createMinSchema(conn, cfg.clientIdentifier, defaultDB)
    console.info('Creating a superuser..')
    fillBuildInRoles(conn, dbDriverName)
    console.info('Database is ready. Run a `ubcli generateDDL` command to create a database tables for a domain')
  } finally {
    fs.renameSync(originalConfigFileName + '.bak', originalConfigFileName)
  }

    /**
     * Create a fake config with authentication disabled & empty domain.
     * Return a default database driver name
     */
  function createFakeConfig () {
    var defaultDB = _.find(config.application.connections, {isDefault: true}) || config.application.connections[0]
    var newConfig = _.cloneDeep(config)
    var dbaConn

    newConfig.security = {}
    newConfig.application.domain = { models: _.filter(config.application.domain.models, {name: 'UB'}) }
    if (cfg.dropDatabase || cfg.createDatabase) {
      dbaConn = _.cloneDeep(defaultDB)
      _.assign(dbaConn, {
        name: '__dba',
        userID: cfg.dba,
        password: cfg.dbaPwd,
        isDefault: false
      })
      if (dbaConn.driver.toLowerCase().startsWith('mssql')) {
        dbaConn.databaseName = 'master'
      }
      newConfig.httpServer.threadPoolSize = 1
      newConfig.application.connections.push(dbaConn)
    }
    fs.writeFileSync(originalConfigFileName, newConfig)
        // uncomment for debug purpose
        // fs.writeFileSync(originalConfigFileName + '.fake', JSON.stringify(newConfig, null, '\t'));
    return defaultDB
  }
}

/**
 * Create a Everyone & admin roles and a SuperUser named admin with password `admin`
 * @param {UBConnection} conn
 * @param {String} dbDriverName
 */
function fillBuildInRoles (conn, dbDriverName) {
  var initSecurity = []
  var isoDate, auditTailColumns, auditTailValues

  if (dbDriverName === 'sqlite3') {
    isoDate = "'" + new Date().toISOString().slice(0, -5) + "Z'"
    auditTailColumns = ',mi_owner,mi_createdate,mi_createuser,mi_modifydate,mi_modifyuser'
    auditTailValues = `,${UBA_COMMON.USERS.ADMIN.ID},${isoDate},${UBA_COMMON.USERS.ADMIN.ID},${isoDate},${UBA_COMMON.USERS.ADMIN.ID}`
    initSecurity.push('PRAGMA foreign_keys = OFF')
  } else {
    auditTailColumns = ''
    auditTailValues = ''
  }
    // build-in roles
  for (let roleName in UBA_COMMON.ROLES) {
    let aRole = UBA_COMMON.ROLES[roleName]
    initSecurity.push(
            `insert into uba_subject (ID,name,sType,mi_unityentity) values(${aRole.ID}, '${aRole.NAME}', 'R', 'UBA_SUBJECT')`,
            `insert into uba_role (ID,name,description,sessionTimeout,allowedAppMethods${auditTailColumns}) 
             values(${aRole.ID},'${aRole.NAME}','${aRole.DESCR}',${aRole.TIMEOUT},'${aRole.ENDPOINTS}'${auditTailValues})`
        )
  }
    // build-in users
  for (let userName in UBA_COMMON.USERS) {
    let aUser = UBA_COMMON.USERS[userName]
    initSecurity.push(
            `insert into uba_subject (ID,name,sType,mi_unityentity) values(${aUser.ID},'${aUser.NAME}', 'U', 'UBA_USER')`,
            `insert into uba_user (ID, name, description, upasswordhashhexa, disabled, udata${auditTailColumns}) 
             values (${aUser.ID}, '${aUser.NAME}', '${aUser.NAME}', '${aUser.HASH}', 0, ''${auditTailValues})`
        )
  }
    // grant roles to users and add admin ELS
  initSecurity.push(
        /* grant all ELS methods for "Admin" role */
        `insert into uba_els (ID,code,description,disabled,entityMask,methodMask,ruleType,ruleRole${auditTailColumns}) 
         VALUES (200, 'UBA_ADMIN_ALL', 'Admins - enable all',0,'*','*','A',${UBA_COMMON.ROLES.ADMIN.ID}${auditTailValues})`,
        /* grant role "Admin" to user "admin" */
        `insert into uba_userrole (ID,userID, roleID${auditTailColumns}) values(800,${UBA_COMMON.USERS.ADMIN.ID},${UBA_COMMON.ROLES.ADMIN.ID}${auditTailValues})`,
        /* grant role "Anonymous" to user "anonymous" */
        `insert into uba_userrole (ID,userID, roleID${auditTailColumns}) values(900,${UBA_COMMON.USERS.ANONYMOUS.ID},${UBA_COMMON.ROLES.ANONYMOUS.ID}${auditTailValues})`
    )
  if (dbDriverName === 'sqlite3') {
    initSecurity.push('PRAGMA foreign_keys = ON')
  }

  initSecurity.forEach(function (stmt) {
    conn.xhr({
      endpoint: 'runSQL', URLParams: {CONNECTION: 'main'}, data: stmt
    })
  })
}
