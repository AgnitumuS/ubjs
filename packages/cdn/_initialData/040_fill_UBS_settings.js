const csvLoader = require('@unitybase/base').dataLoader
const path = require('path')
/**
 * Fill UBS model settings
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let conn = session.connection

  console.info('\tFill default settings for UBS model')
  csvLoader.loadSimpleCSVData(conn, path.join(__dirname, 'ubs_settings-CDN.csv'),
    'ubs_settings',
    'settingKey;type;defaultValue;settingValue;name;description'.split(';'),
    [0, 1, 2, 3, 4, 5], 1
  )
}
