/**
 * `aclRls` mixin implements a Row Level Security based on Access Control List.
 * See [ACL RLS topic in entities tutorial](https://unitybase.info/api/server-v5/tutorial-entites.html#aclrls---access-control-list-row-level-security) for details.
 *
 * Configuration
 * "mixins": {
 *   "aclRls": {
 *     "sameAs": "nameOfEntityWhichACLIsUsed"
 *     "entityConnectAttr": ""attributeWhereInstanceIdIsStored", (applicable for sameAs)
 *     "instanceIdAttribute": "attributeWhereInstanceIdIsStored", (applicable for sameAs)
 *
 *     "useUnityName": false, // DEPRECATED
 *     "onEntities": ["entity_one", ....],
 *     "skipIfFn": "functionWithNS", // new. default is `ubaCommon.isSuperUser() || ubaCommon.haveAdminRole()`
 *     "subjectIDsFn": "functionWithNS", // new. replace exprMethod. Should return ID's array to be used as valueID filter
 *     "exprMethod": "DEPRECATED! methodWhatCreatesSubQuery", //
 *     "selectionRule": "Exists", // "In"
 *     "model": "modelWhereToCreateAclRlsStorageEntity"
 *   }
 * }
 *
 * @implements MixinModule
 */

const UB_SPN_SKIPACLRLS = '__skipAclRls'
const ACL_RLS_WHERE_LIST_PREDICATE = '__aclRlsFilter'

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
  const aclStorageEntityName = props.__aclStorageEntityName

  if (mixinCfg.exprMethod) {
    console.error(`AclRls: '${entity.code}.mixins.aclRls.exprMethod' is obsolete. Please, remove 'exprMethod'. Fallback to default 'skipIfFn' and 'subjectIDsFn'`)
  }
  // console.debug('AclRls for', entity.code, 'props are', props, 'mixincfg is', mixinCfg)
  const skipIfFn = funcFromNS(mixinCfg.skipIfFn, entity.code)
  const subjectIDsFn = funcFromNS(mixinCfg.subjectIDsFn, entity.code)
  if (!subjectIDsFn) {
    throw new Error(`AclRls: '${entity.code}.mixins.aclRls.subjectIDsFn' is mandatory`)
  }
  if (subjectIDsFn.validator) {
    subjectIDsFn.validator(mixinCfg)
  }

  // this method is called from native FTS in TubFTSHelper.GetEntityAclRlsFilterIDValues
  entityModule.__internalGetAclSbjIDs = (function () {
    return function (ctx) {
      if (skipIfFn && skipIfFn(ctx.mParams)) {
        console.log('skipped because skipIfFn()==true')
        return []
      } else {
        return subjectIDsFn(ctx, mixinCfg)
      }
    }
  })()
  const entityConnectAttr = mixinCfg.entityConnectAttr || 'ID'

  console.log(`ALC RLS: added handler for ${entity.name}.select:before`)
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
    if (mParams[UB_SPN_SKIPACLRLS]) {
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

    if (!subjectIDs.length) {
      whereList[ACL_RLS_WHERE_LIST_PREDICATE] = {
        expression: '(0=1)',
        condition: 'custom'
      }
      return
    }
    if (mixinCfg.selectionRule === 'Exists') {
      whereList[ACL_RLS_WHERE_LIST_PREDICATE] = {
        expression: entityConnectAttr,
        condition: 'subquery',
        subQueryType: 'exists',
        value: {
          entity: aclStorageEntityName,
          whereList: {
            byInstanceID: {
              expression: `[instanceID] = {master}.${entityConnectAttr}`,
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
      whereList[ACL_RLS_WHERE_LIST_PREDICATE] = {
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
    console.log(JSON.stringify(whereList, null, ' '))
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
