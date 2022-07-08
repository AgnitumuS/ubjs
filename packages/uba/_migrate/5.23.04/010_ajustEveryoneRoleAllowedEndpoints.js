const UBA_COMMON = require('@unitybase/base').uba_common
/**
 * Exclude `getDomainInfo,ubql,rest` from allowed endpoints for Everyone (01_roles.yml allows these endpoints for User)
 * @param {SyncConnection} conn
 */
module.exports = function fixRelatedEntityFilterName ({ conn }) {
  console.log('Migration script start: ', __filename)
  const modifyDate = conn.Repository('uba_role')
    .attrs('mi_modifyDate')
    .where('ID', '=', UBA_COMMON.ROLES.EVERYONE.ID)
    .selectScalar()

  conn.query({
    entity: 'uba_role',
    method: 'update',
    execParams: {
      ID: UBA_COMMON.ROLES.EVERYONE.ID,
      allowedAppMethods: UBA_COMMON.ROLES.EVERYONE.ENDPOINTS,
      mi_modifyDate: modifyDate
    }
  })
  console.log('Migration script finish: %s', __filename)
}
