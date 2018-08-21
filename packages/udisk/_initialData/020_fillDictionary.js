/**
 * Fill ORG dictionaries from csv files
 * Used by cmd\initialize command
 * @param {cmd.argv.serverSession} session
 */
module.exports = function (session) {
  var
    csvLoader = require('dataLoader'),
    conn = session.connection

  console.info('\tFill common dictionaries data (UDISK model)')

  console.info('\t\tFill enumeration for UDISK model')
  csvLoader.loadSimpleCSVData(conn, __dirname + '/udisk_enum-udisk.csv', 'ubm_enum', 'eGroup;code;name;sortOrder'.split(';'), [0, 1, 2, 3])
}
