const UB = require('@unitybase/ub')
const App = UB.App
const Session = UB.Session

/**
 * Test mixin - sets a default value for "code" attribute for addNew method
 * Configuration
 * "mixins": {
 *   "testMixin": {
 *     "codeDefault": "default value for code attribute"
 *   }
 * }
 *
 * @implements MixinModule
 */
module.exports = {
  initDomain: initDomainForTestMixin,
  initEntity: initEntityForTestMixin
}

function initDomainForTestMixin() {
  console.log('testMixin initialization for domain')

  App.on('addConnectionToRequest', (name) => {
    console.log(`testMixin addConnectionToRequest event handler - connection ${name} added to context`)
    const mainConn = App.dbConnections['main']
    if (name === 'main' && mainConn.config.dialect === 'PostgreSQL') {
      const val0 = mainConn.runParsed("SELECT current_setting('ub.session_id', true) AS sessionID")
      console.log(`Initial value from db = ${val0}`)
      mainConn.runParsed(`SELECT set_config('ub.session_id', ?, false)`, [Session.id])
      const val1 = mainConn.runParsed("SELECT current_setting('ub.session_id', true) AS sessionID")
      console.log(`Current session id = ${Session.id}, value from db = ${val1}`)
    }
  })
}

/**
 * Adds a addnew:before and insert:before
 * @param {UBEntity} entity Entity for initialization
 * @param {UBEntityMixin} mixinCfg Mixin configuration from entity metafile
 */
function initEntityForTestMixin(entity, mixinCfg) {
  console.debug(`testMixin initialization for entity ${entity.name} using config ${JSON.stringify(mixinCfg)}`)
  if (!entity.mixins.mStorage || !entity.mixins.mStorage.enabled) {
    throw new Error(`mStorage mixin must be enable for entity ${entity.name} in order to use mixin 'testMixin'`)
  }
  if (!entity.attributes.code) {
    throw new Error(`Entity '${entity.name}' must have "code" attribute in order to use mixin 'testMixin'`)
  }
  if (!mixinCfg.codeDefault) {
    throw new Error(`'codeDefault' must be defined in 'testMixin' mixin configuration of entity '${entity.name}'`)
  }
  const entityModule = global[entity.name]

  entityModule.on('addnew:before', ctx => {
    if (!ctx.mParams.execParams) ctx.mParams.execParams = {}
    ctx.mParams.execParams.code = mixinCfg.codeDefault
    console.log('testMixin processing for addnew:before with cfg ' + mixinCfg.codeDefault)
  })
  entityModule.on('insert:before', ctx => {
    console.log('testMixin processing for insert:before')
  })
}
