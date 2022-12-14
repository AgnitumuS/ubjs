module.exports = addAclRlsStorageEntities

let allModels

/**
 * Verify model exists in domain
 *
 * @param {object} domainJson
 * @param {string} modelName
 * @returns {boolean}
 */
function modelExists (domainJson, modelName) {
  if (!allModels) {
    allModels = new Set()
    for (const entityName in domainJson) {
      allModels.add(domainJson[entityName].modelName)
    }
  }
  return allModels.has(modelName)
}

/**
 * Add entities for storing ACL of aclRLS mixin
 *
 * @param {object<string, {modelName: string, meta: object, langs: object<string, object>}>} domainJson
 * @param {object} serverConfig
 */
function addAclRlsStorageEntities (domainJson, serverConfig) {
  console.info('adding ACL RLS storage entities...')
  const entity2acl = {}
  for (const entityName in domainJson) {
    const entityMeta = domainJson[entityName].meta
    let props = entityMeta.mixins && entityMeta.mixins.aclRls
    if (!props || (props.enabled === false)) continue // no aclRls mixin
    // console.debug('Start adding AclRlsStorageEntity for ', entityName)
    let realAclEntityName, realAclEntityMeta
    if (props.sameAs) {
      realAclEntityName = props.sameAs
      if (!domainJson[realAclEntityName]) throwConfigError(entityName, `'sameAs' uses non-existent entity '${realAclEntityName}'`)
      realAclEntityMeta = domainJson[props.sameAs].meta
      if (!realAclEntityMeta.mixins.aclRls) throwConfigError(entityName, `entity '${realAclEntityName}' specified as 'sameAs' do not have aclRls mixin`)
      if (realAclEntityMeta.mixins.aclRls.sameAs) throwConfigError(entityName, `'sameAs' can be one level nested, but entity '${realAclEntityName}' also configured as 'sameAs'`)
      props = Object.assign({}, serverConfig.application.mixinsDefaults.aclRls, props, realAclEntityMeta.mixins.aclRls)
    } else {
      props = Object.assign({}, serverConfig.application.mixinsDefaults.aclRls, props)
      realAclEntityName = entityName
      realAclEntityMeta = entityMeta
    }
    const { masterEntityName, aclStorageEntityName, aclStorageAlias } = getAclEntityCfg(domainJson, realAclEntityMeta, realAclEntityName)
    if (!Array.isArray(props.onEntities) || !props.onEntities.length) {
      throwConfigError("'onEntities' must be non empty array")
    }
    props.aclStorageEntityName = aclStorageEntityName
    entityMeta.mixins.aclRls = props // override props by new object with defaults and aclStorageEntityName defined

    // console.debug('HOOK AclRls for', entityName, 'props are', props)
    if (!entity2acl[aclStorageEntityName]) {
      entity2acl[aclStorageEntityName] = []
    }
    entity2acl[aclStorageEntityName].push(entityName)

    if (domainJson[aclStorageEntityName]) continue // ACL RLS storage already added

    let aclStorageModel = props.model
    if (aclStorageModel && !modelExists(domainJson, aclStorageModel)) {
      throwConfigError(entityName, `model '${aclStorageModel}' specified in 'aclRls.model' not in domain`)
    }
    if (!aclStorageModel) aclStorageModel = domainJson[masterEntityName].modelName

    const aclStorageMeta = {
      code: aclStorageEntityName,
      name: aclStorageEntityName,
      caption: "Autogenerated storage of 'aclRls' data",
      sqlAlias: aclStorageAlias,
      connectionName: entityMeta.connectionName,
      attributes: [{
        name: 'instanceID',
        caption: 'instanceID',
        dataType: 'Entity',
        associatedEntity: masterEntityName,
        allowNull: false
      }, {
        name: 'valueID',
        caption: 'valueID',
        dataType: 'BigInt',
        allowNull: false
      }],
      dbKeys: {}, // added below
      mixins: {
        // audit: {
        //   enabled: (entityMeta.mixins && entityMeta.mixins.audit && entityMeta.mixins.audit.enabled),
        //   parentIdentifier: 'instanceID',
        //   parentEntity: entityName
        // },
        mStorage: {},
        aclRlsStorage: {}
      }
    }
    // unique index on instanceID + valueID (aclRls.insert skip inserting of duplicates)
    aclStorageMeta.dbKeys[`UIDX_${aclStorageAlias.toUpperCase()}_IIVI`] = {
      instanceID: {},
      valueID: {}
    }

    for (const linkedE of props.onEntities) {
      const le = domainJson[linkedE]
      if (!le) throwConfigError(entityName, `entity '${linkedE}' specified in 'onEntities' not in domain`)
      if (!le.meta.sqlAlias) {
        throwConfigError(entityName, `expect entity '${linkedE}' listed in 'onEntities' to have an sqlAlias`)
      }
      const attrCode = `${le.meta.sqlAlias}ID`
      aclStorageMeta.attributes.push({
        name: attrCode,
        caption: linkedE,
        dataType: 'Entity',
        associatedEntity: linkedE,
        customSettings: {
          hiddenInDetails: true
        }
      })
    }

    domainJson[aclStorageEntityName] = {
      modelName: aclStorageModel,
      meta: aclStorageMeta,
      langs: null
    }
    // console.debug('Added:', JSON.stringify(domainJson[aclStorageEntityName], null, ' '))
  }
  for (const en in entity2acl) {
    console.debug(`${en.padEnd(20, ' ')} is an ACL storage for: ${entity2acl[en].join(', ')}`)
  }
}

/**
 * @param domainJson
 * @param entityMeta
 * @param entityName
 * @returns {{aclStorageAlias: string, masterEntityName, aclStorageEntityName: string}}
 */
function getAclEntityCfg (domainJson, entityMeta, entityName) {
  const props = entityMeta.mixins.aclRls
  let masterEntityName, aclStorageEntityName, aclStorageAlias
  if (props.useUnityName) {
    if (!entityMeta.mixins.unity) throwConfigError(entityName, "if 'useUnityName' is true entity must have a unity mixin")
    masterEntityName = entityMeta.mixins.unity.entity
    if (!domainJson[masterEntityName]) throwConfigError(entityName, `unity mixin points to non-existent entity '${masterEntityName}'`)
    const unityEntityMeta = domainJson[masterEntityName].meta
    if (!unityEntityMeta.sqlAlias) throwConfigError(entityName, `expect unity entity '${masterEntityName}' to have an sqlAlias - because 'useUnityName=true'`)
    aclStorageEntityName = masterEntityName + '_acl'
    aclStorageAlias = unityEntityMeta.sqlAlias + 'acl'
  } else {
    masterEntityName = entityName
    aclStorageEntityName = masterEntityName + '_acl'
    if (!entityMeta.sqlAlias) throwConfigError(entityName, 'expect entity to have a sqlAlias')
    aclStorageAlias = entityMeta.sqlAlias + 'acl'
  }
  return { masterEntityName, aclStorageEntityName, aclStorageAlias }
}
/**
 * @param entityName
 * @param msg
 */
function throwConfigError (entityName, msg) {
  throw new Error(`Invalid 'aclRls' mixin config for '${entityName}': ${msg}`)
}
