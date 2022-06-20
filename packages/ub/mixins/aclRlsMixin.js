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
const Session = require('../modules/Session')

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

  if (mixinCfg.exprMethod) {
    throw new Error(`AclRls: '${entity.code}.mixins.aclRls.exprMethod' is obsolete. Please, remove 'exprMethod' for default behavior or use 'skipIfFn' and 'subjectIDsFn'`)
  }
  if (mixinCfg.skipIfFn === undefined) mixinCfg.skipIfFn = App.serverConfig.mixinsDefaults.aclRls.skipIfFn
  const skipIfFn = funcFromNS(mixinCfg.skipIfFn, entity.code)
  if (mixinCfg.subjectIDsFn === undefined) mixinCfg.subjectIDsFn = App.serverConfig.mixinsDefaults.aclRls.subjectIDsFn
  const subjectIDsFn = funcFromNS(mixinCfg.subjectIDsFn, entity.code)
  if (subjectIDsFn.validator) {
    subjectIDsFn.validator(mixinCfg)
  }
  if (!subjectIDsFn) {
    throw new Error(`AclRls: '${entity.code}.mixins.aclRls.subjectIDsFn' is mandatory`)
  }
  const entityConnectAttr = mixinCfg.entityConnectAttr || 'ID'

  entityModule.on('select:before', App.wrapEnterLeaveForUbMethod(
    `method(aclRls) ${entity.name}.select:before`,
    aclRlsAddSelectFilter
  ))

  /**
   * Add whereList for aclRls
   * @param {ubMethodParams} ctx
   */
  function aclRlsAddSelectFilter (ctx) {
    const mParams = ctx.mParams
    if (mParams[UB_SPN_skipAclRls]) {
      console.log('skipped because of __skipAclRls')
      return
    }
    if (skipIfFn && skipIfFn(ctx.mParams)) {
      console.log('skipped because skipIfFn()==true')
      return
    }
    const subjectIDs = subjectIDsFn(ctx, mixinCfg)

    let whereList = mParams.whereList
    if (!whereList) {
      mParams.whereList = {}
      // whereList = mParams.whereList = {} assign a {} to whereList instead of TubList instance
      whereList = mParams.whereList
    }
    const wiName = whereList.getUniqKey()
    if (!subjectIDs.length) {
      whereList[wiName] = {
        expression: '(0=1)',
        condition: 'custom'
      }
      return
    }
    if (mixinCfg.selectionRule === 'Exists') {
      whereList[wiName] = {
        condition: 'subquery',
        subQueryType: 'exists',
        value: {
          entity: aclStorageEntityName,
          whereList: {
            byInstanceID: {
              expression: `[instanceID] = [{master}.${entityConnectAttr}]`,
              condition: 'custom'
            },
            byValueID: {
              expression: '[valueID]',
              condition: 'in',
              value: subjectIDs
            }
          }
        }
      }
    } else { // In
      whereList[wiName] = {
        expression: entityConnectAttr,
        condition: 'subquery',
        subQueryType: 'in',
        value: {
          entity: aclStorageEntityName,
          fieldList: ['instanceID'],
          groupList: ['instanceID'],
          whereList: {
            byOrgUnitID: {
              expression: '[valueID]',
              condition: 'in',
              value: subjectIDs
            }
          }
        }
      }
    }
  }
}

/**
 * Parse func namespace 'uba_user.somefunc' (string) -> uba_user.somefunc (function)
 * @param {string} ns
 * @param {string} entityCode
 * @returns {function|null}
 */
function funcFromNS (ns, entityCode) {
  if (!ns) return null
  const fPath = ns.split('.')
  let f = global[fPath[0]]
  for (let i = 1, L = fPath.length; i < L; i++) {
    if (!f) break
    f = f[fPath[i]]
  }
  if (typeof f !== 'function') {
    throw new Error(`AclRls: '${entityCode}.mixins.aclRls.skipIfFn' expression '${ns}' resolves to '${f}' but must be resolved to function`)
  }
  return f
}
