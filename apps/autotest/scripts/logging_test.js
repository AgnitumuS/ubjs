/**
 * @author pavel.mash
 * Date: 2020-04-27
 * Script for compare logging output for different databases
 */
const cmdLineOpt = require('@unitybase/base').options
const base = require('@unitybase/base')
const argv = base.argv
const path = require('path')

module.exports = function runSeveralQueries (options) {
  console.info(`Console.info`)
  console.warn(`Console.warn`)
  console.debug(`Console.debug`)
  console.log(`Console.log`)
  console.error(`Console.error`)

  if (!options) {
    const opts = cmdLineOpt.describe('', 'Logging test')
      .add(argv.establishConnectionFromCmdLineAttributes._cmdLineParams)
    options = opts.parseVerbose({}, true)
    if (!options) return
  }

  const session = argv.establishConnectionFromCmdLineAttributes(options)
  const conn = session.connection

  console.log('select for non-prepared statement')
  conn.Repository('uba_user').attrs('ID', 'name').where('ID', '>', 100).select()
  console.log('select for prepared statement')
  conn.Repository('uba_user').attrs('ID', 'name').where('ID', '>', 100).select()

  console.log('direct query for not prepared statement')
  conn.xhr({endpoint: 'runSQL', data: `select ID from uba_user where ID > 100`})
}
