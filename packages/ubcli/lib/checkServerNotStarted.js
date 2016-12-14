/**
  Command line module. Throw error in case server is started.

  @module cmd/checkServerNotStarted
  @author pavel.mash
 */
const {options, argv} = require('@unitybase/base')

module.exports = function initialize (cfg) {
  if (!cfg) {
    var opts = options.describe('cmd/checkServerNotStarted', 'This command throw error in case server is started')
            .add({short: 'host', long: 'host', param: 'fullServerURL', defaultValue: 'http://localhost:888', searchInEnv: true, help: 'Server URL to connect, including protocol'})
    cfg = opts.parseVerbose({}, true)
    if (!cfg) return
  }
  if (argv.checkServerStarted(cfg.host)) {
    throw new Error('Somebody listen on ' + cfg.host + '. If this is UnityBase server - please, shut down it')
  }
}

