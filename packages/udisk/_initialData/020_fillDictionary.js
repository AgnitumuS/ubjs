/**
 * Fill UDisc dictionaries from csv files
 * Used by cmd\initialize command
 * @param {cmd.argv.serverSession} session
 */
module.exports = function (session) {
  const conn = session.connection
  const csvLoader = require('@unitybase/base').dataLoader
  const path = require('path')
  console.info('\t\tFill enumeration for UDISK model')
  csvLoader.loadSimpleCSVData(conn, path.join(__dirname, 'udisk_enum-udisk.csv'),
    'ubm_enum', 'eGroup;code;name;sortOrder'.split(';'),
    [0, 1, 2, 3])
}
