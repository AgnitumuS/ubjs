/**
 * After DDL generation add a row for autotest
 * @param {SyncConnection} conn
 * @param {Object<string, DBConnection>} dbConnections
 * @param {Object} dbVersions
 * @param {{hooks: Array<{model: string, hook: Object<string, function>}>, files: Array<{model: string, name: string, fullPath: string, sha: string}>}} migrations
 */
module.exports = function addAfterDDLToTstDictionary ({ conn, dbConnections, dbVersions, migrations }) {
  conn.insert({
    entity: 'tst_dictionary',
    execParams: {
      code: 'AFTERDDL',
      caption: 'afterDDL hook',
      filterValue: 1
    }
  })
}
