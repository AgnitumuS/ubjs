const path = require('path')
/**
 * Fill ELS for UBM model
 * @param {ServerSession} session
 */
module.exports = function (session) {
  'use strict'
  var csvLoader = require('@unitybase/base').dataLoader; var conn = session.connection

  console.info('\tFill test ELS for UBM model')
  csvLoader.loadSimpleCSVData(conn,
    path.join(__dirname, 'tst_els_select_anonymous.csv'),
    'uba_els',
    'code;entityMask;methodMask;ruleType;ruleRole;description'.split(';'), [
      0, 1, 2, 3,
      function (row) {
        if (typeof row[4] === 'number') {
          return row[4]
        } else {
          return conn.lookup('uba_role', 'ID', { expression: 'name', condition: 'equal', value: row[4] })
        }
      },
      5], 1
  )
}
