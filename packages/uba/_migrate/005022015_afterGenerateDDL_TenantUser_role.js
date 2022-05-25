const uba_common = require('@unitybase/base').uba_common

module.exports = function ({ conn }) {
  const r = uba_common.ROLES.TENANT_USER
  if (!r) {
    return
  }

  const exists = !!conn.Repository('uba_role')
    .attrs('ID')
    .where('name', '=', r.NAME)
    .selectScalar()
  if (exists) {
    console.warn('Role %s already exists', r.NAME)
    return
  }

  conn.insert({
    entity: 'uba_role',
    execParams: {
      ID: r.ID,
      name: r.NAME,
      description: r.DESCR,
      sessionTimeout: r.TIMEOUT,
      allowedAppMethods: r.ENDPOINTS
    }
  })
}
