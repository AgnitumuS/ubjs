/**
 * `aclRls` mixin implements a Row Level Security based on Access Control List.
 * See [File system storage tutorial](https://unitybase.info/api/server-v5/tutorial-mixins_fsstorage.html) for details.
 *
 * Configuration
 * "mixins": {
 *   "aclRls": {
 *     "useUnityName": false,
 *     "onEntities": ["entity_one", ....],
 *     "entityConnectAttr": "ID",
 *     "skipIfFn": "functionWithNS", // new. default is `ubaCommon.isSuperUser() || ubaCommon.haveAdminRole()`
 *     "subjectIDsFn": "functionWithNS", // new. replace exprMethod. Should return ID's array to be used as valueID filter
 *     "exprMethod": "methodWhatCreatesSubQuery", //
 *     "selectionRule": "Exists", // "In"
 *     "model": "modelWhereToCreateAclRlsStorageEntity"
 *   }
 * }
 *
 * @implements MixinModule
 */

const UB_SPN_skipAclRls = '__skipAclRls'
module.exports = {
  initDomain: null,
  initEntity: initEntityForAclRls
}

const App = require('../modules/App')

/**
 * Add select:before event for each entity with aclRls method what
 *
 * @param {UBEntity} entity Entity for initialization
 * @param {UBEntityMixin} mixinCfg Mixin configuration from entity metafile
 */
function initEntityForAclRls (entity, mixinCfg) {
  const entityModule = global[entity.code]
  const props = entity.mixins.aclRls
  // method expect mixin props are validated in metadata hook
  const aclStorageEntityName = (props.useUnityName ? entity.mixins.unity.entity : entity.name) + '_acl'


  entityModule.on('select:before', App.wrapEnterLeaveForUbMethod(
    `method(aclRls) ${entity.name}.select:before`,
    aclRlsAddSelectFilter
  ))

  /**
   * @param {ubMethodParams} ctx
   */
  function aclRlsAddSelectFilter (ctx) {
    const mParams = ctx.mParams
    if (mParams[UB_SPN_skipAclRls]) {
      console.log('skipped because of __skipAclRls')
      return
    }
    if ()

  }
}
