/**
 * @author pavel.mash
 * Create roles users / powerUsers / supervisors
 */

/**
 * Initial script for create UnityBase Administration desktop navigation shortcuts for UBA model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  const conn = session.connection

  console.log('\t\tcreate `orgNodeAdmin` role')
  conn.insert({
    entity: 'uba_role',
    execParams: {
      name: 'orgNodeAdmin',
      description: 'Administrator of organization node.',
      sessionTimeout: 30
    }
  })

  console.log('\t\tcreate `orgAllNodeAccess` role')
  conn.insert({
    entity: 'uba_role',
    execParams: {
      name: 'orgAllNodeAccess',
      description: 'Administrator of all organization node.',
      sessionTimeout: 30
    }
  })
}
