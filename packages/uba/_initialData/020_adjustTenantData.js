/**
 * @param {ServerSession} session
 */
module.exports = function (session) {
  const hook = require('../_migrate/_hooks').finalize
  if (hook) {
    // The hook fixes issues in uba_subject and creates ELS records for TenantUser built-in role
    hook({conn: session.connection})
  }
}
