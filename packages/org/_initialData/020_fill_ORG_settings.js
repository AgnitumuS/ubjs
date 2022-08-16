/**
 * Fill UBS model settings
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  const csvLoader = require('@unitybase/base').dataLoader
  const conn = session.connection

  console.info('\tFill default settings for ORG model')
  csvLoader.loadSimpleCSVData(conn, __dirname + '/org_settings-ORG.csv', 'ubs_settings', 'settingKey;type;defaultValue;settingValue;name;description'.split(';'), [0, 1, 2, 3, 4, 5], 1)
}
