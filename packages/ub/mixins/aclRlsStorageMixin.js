const App = require('../modules/App')
const { UBAbort } = require('../modules/ubErrors')
/**
 * An ACL storage implementation for entities with aclRls mixin. Mixin tasks are:
 *   - subscribe on insert:before/update:before event and:
 *     - validate input data contain only one of possible `onEntities` value and fill `valueID`
 *     - validate instanceID is passed
 *
 * This mixin is used internally by entities what created automatically by aclRls - should not be used directly in meta files
 *
 * Configuration
 * "mixins": {
 *   "aclRlsStorage": {
 *   }
 * }
 *
 * @implements MixinModule
 */
module.exports = {
  initDomain: null,
  initEntity: initEntityForAclRlsStorage
}

/**
 *
 *
 * @param {UBEntity} entity Entity for initialization
 * @param {UBEntityMixin} mixinCfg Mixin configuration from entity metafile
 */
function initEntityForAclRlsStorage (entity, mixinCfg) {
  global[entity.code].on('insert:before', validateAclRlsInsUpd)
}

/**
 *
 * @param {ubMethodParams} ctx
 */
function validateAclRlsInsUpd (ctx) {
  const execParams = ctx.mParams.execParams
  const { instanceID } = execParams
  if (!instanceID) throw new UBAbort('Parameter \'instanceID\' is required')
  let valueID
  const passedParamNames = Object.keys(execParams)
  passedParamNames.forEach(prm => {
    if (prm !== 'ID' && prm !== 'instanceID') {
      if (valueID) throw new UBAbort(`Only one subject type can be used as aclRls member at once, but found non null '${prm}' value in execParams`)
      valueID = execParams[prm]
    }
  })
  execParams.valueID = valueID
}
