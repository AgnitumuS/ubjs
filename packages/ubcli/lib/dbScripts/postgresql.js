/**
 * Create PostgreSQl database & database objects for a UnityBase ORM
 * @module cmd/initDB/postgreSQL
 */

const DBA_FAKE = '__dba'
const path = require('path')
const fs = require('fs')

/**
 * Drop a specified schema & role (databaseName)
 * @param {ServerSession} session
 * @param {Object} databaseConfig A database configuration
 */
module.exports.dropDatabase = function dropDatabase (session, databaseConfig) {
  let conn = session.connection
  conn.xhr({
    endpoint: 'runSQL',
    URLParams: {CONNECTION: DBA_FAKE},
    data: `DROP SCHEMA IF EXISTS ${databaseConfig.userID} CASCADE; DROP USER IF EXISTS ${databaseConfig.userID};`
  })
}

/**
 * Drop a specified schema & role (databaseName) with a pwd
 * @param {SyncConnection} conn
 * @param {Object} databaseConfig A database configuration
 */
module.exports.createDatabase = function createDatabase (conn, databaseConfig) {
  conn.xhr({
    endpoint: 'runSQL',
    URLParams: {CONNECTION: DBA_FAKE},
    data: `CREATE ROLE ${databaseConfig.userID} LOGIN PASSWORD '${databaseConfig.password}' VALID UNTIL 'infinity'; CREATE SCHEMA ${databaseConfig.userID} AUTHORIZATION ${databaseConfig.userID};`
  })
}

/**
 * Create a minimally required  functions & tables for a first sign-in
 * @param {SyncConnection} conn
 * @param {Number} clientNum A number of client we create database for
 * @param {Object} databaseConfig A database configuration
 */
module.exports.createMinSchema = function createMinSchema (conn, clientNum, databaseConfig) {
  let sequences = 'CREATE SEQUENCE SEQ_UBMAIN INCREMENT 1 MAXVALUE   {0}4999999999 START   {0}0000000000 CYCLE CACHE 1; CREATE SEQUENCE SEQ_UBMAIN_BY1 INCREMENT 1 MAXVALUE {0}999999999999 START {0}500000000000 CYCLE CACHE 1;'
  conn.xhr({
    endpoint: 'runSQL',
    URLParams: {CONNECTION: databaseConfig.name},
    data: UB.format(sequences, clientNum)
  })
  let script = fs.readFileSync(path.join(__dirname, 'postgresqlObjects.sql'), 'utf8')
  conn.xhr({
    endpoint: 'runSQL',
    URLParams: {CONNECTION: databaseConfig.name},
    data: script
  })
  script = fs.readFileSync(path.join(__dirname, 'postgresqlTables.sql'), 'utf8')
  conn.xhr({
    endpoint: 'runSQL',
    URLParams: {CONNECTION: databaseConfig.name},
    data: script
  })
}
