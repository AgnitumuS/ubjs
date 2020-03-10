/**
 * Fill ORG dictionaries from csv files
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  const csvLoader = require('@unitybase/base').dataLoader
  const conn = session.connection

  console.info('\tFill common dictionaries data (ORG model)')

  console.info('\t\tFill enumeration for ORG model')
  csvLoader.loadSimpleCSVData(conn, __dirname + '/ubm_enum-org.csv', 'ubm_enum', 'eGroup;code;name;sortOrder'.split(';'), [0, 1, 2, 3])
}
