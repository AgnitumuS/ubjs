const csvLoader = require('@unitybase/base').dataLoader
const path = require('path')
/**
 * Fill ELS for CDN model
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let conn = session.connection

  console.info('\tFill ELS for CDN model')
  csvLoader.loadSimpleCSVData(conn, path.join(__dirname, 'cdn_els.csv'), 'uba_els',
    'code;entityMask;methodMask;ruleType;ruleRole;description'.split(';'), [
      0, 1, 2, 3,
      function (row) {
        if (typeof row[4] === 'number') {
          return row[4]
        } else {
          return conn.lookup('uba_role', 'ID', { expression: 'name', condition: 'equal', values: { name: row[4] } })
        }
      },
      5
    ], 1)
}
