const { UBAbort } = require('../modules/ubErrors')
const App = require('../modules/App')
const Repository = require('@unitybase/base').ServerRepository.fabric

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
  const entityModule = global[entity.code]
  entityModule.insert = App.wrapEnterLeaveForUbMethod(`method(aclRlsStorage) ${entity.name}.insert`, aclRlsStorageInsert)
  entityModule.entity.addMethod('insert')
  global[entity.code].on('update:before', denyUpdateForAclRls)
}

/**
 * @param {ubMethodParams} ctx
 */
function aclRlsStorageInsert (ctx) {
  const execParams = ctx.mParams.execParams
  const { instanceID } = execParams
  if (!instanceID) throw new UBAbort('Parameter \'instanceID\' is required')
  let valueID
  const passedParamNames = Object.keys(execParams)
  passedParamNames.forEach(prm => {
    if (prm !== 'ID' && prm !== 'instanceID') {
      if (valueID) throw new UBAbort(`Only one subject type can be used as aclRls member at once, but found non null '${prm}' value in execParams`)
      valueID = +execParams[prm]
    }
  })
  if (!valueID) throw new UBAbort('One of subject must be non-null in execParams')
  execParams.valueID = valueID
  const entityCode = ctx.dataStore.entityCode || ctx.mParams.entity // TODO - remove hack after adding ctx.entityCode
  // validate record not exists. If exists - skip insertion and add existed record ID into result
  const existedID = Repository(entityCode).attrs('ID')
    .where('instanceID', '=', instanceID)
    .where('valueID', '=', valueID)
    .selectScalar()
  if (existedID) {
    execParams.ID = existedID
    ctx.preventDefault() // skip mStorage insertion - record already exists
  }
  // actual insertion will be done in mStorage mixin
}

/**
 * @param {ubMethodParams} ctx
 */
function denyUpdateForAclRls (ctx) {
  throw new UBAbort('Update method is not applicable for aclRls storage entity')
}
