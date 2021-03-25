const cmdLineOpt = require('@unitybase/base').options
const base = require('@unitybase/base')
const argv = base.argv

module.exports = function runAsRoot (options) {
  if (!options) {
    const opts = cmdLineOpt.describe('', 'Root test')
      .add(argv.establishConnectionFromCmdLineAttributes._cmdLineParams)
    options = opts.parseVerbose({}, true)
    if (!options) return
  }
  console.log('Force connect as root..')
  options.user = 'root'
  options.password = '-'
  const session = argv.establishConnectionFromCmdLineAttributes(options)
  const conn = session.connection
  const { adminID, miModifyDate } = conn.Repository('uba_user')
    .attrs('ID', 'mi_modifyDate').where('name', '=', 'admin')
    .selectSingle({ ID: 'adminID', mi_modifyDate: 'miModifyDate' })
  console.log('Checking root can bypass attributes restriction..')
  conn.query({
    entity: 'uba_user',
    method: 'update',
    execParams: {
      ID: adminID,
      trustedIP: '0.0.0.0',
      mi_modifyDate: miModifyDate
    }
  })
}
