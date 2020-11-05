module.exports = {
  beforeGenerateDDL
}

/**
 * before generate DDL hook example
 * @param {SyncConnection} conn
 * @param {Object<string, DBConnection>} dbConnections
 * @param {Object} dbVersions
 * @param {Array<{model: string, name: string, fullPath: string, sha: string}>} files
 */
function beforeGenerateDDL ({ conn, dbConnections, dbVersions, files }) {

}
