const { UBAbort } = require('../modules/ubErrors')
/**
 * An ACL storage implementation for entities with aclRls mixin. Mixin tasks are:
 *   - subscribe on insert:before event and:
 *     - validate input data contain only one of possible `onEntities` value and fill `valueID`
 *     - validate instanceID is passed
 *   - subscribe on update:before event and throws (update is not applicable)
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
  global[entity.code].on('insert:before', validateAclRlsIns)
  global[entity.code].on('update:before', denyUpdateForAclRls)
}

/**
 * @param {ubMethodParams} ctx
 */
function validateAclRlsIns (ctx) {
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
  if (!valueID) throw new UBAbort('One of subject must be non-null in execParams')
  execParams.valueID = +valueID
}

/**
 * @param {ubMethodParams} ctx
 */
function denyUpdateForAclRls (ctx) {
  throw new UBAbort('Update method is not applicable for aclRls storage entity')
}
