module.exports = addAclRlsStorageEntities

/**
 * Add entities for storing data of ACL RLS mixin
 * @param {object<string, {modelName: string, meta: object, langs: object<string, object>}>} domainJson
 * @param {object} serverConfig
 */
function addAclRlsStorageEntities (domainJson, serverConfig) {
  for (const entityName in domainJson) {
    const entityMeta = domainJson[entityName].meta
    const props = entityMeta.mixins && entityMeta.mixins.aclRls
    if (!props || (props.enabled === false)) return // no aclRls mixin

    if (!Array.isArray(props.onEntities) || !props.onEntities.length) {
      throwConfigError("'onEntities' must be non empty array")
    }

    let masterEntityName, aclStorageEntityName, aclStorageAlias
    if (props.useUnityName) {
      if (!entityMeta.mixins.unity) throwConfigError("if 'useUnityName' is true entity must have a unity mixin")
      masterEntityName = entityMeta.mixins.unity.entity
      if (!domainJson[masterEntityName]) throwConfigError(`unity mixin points to non-existent entity '${masterEntityName}'`)
      const unityEntityMeta = domainJson[masterEntityName].meta
      aclStorageEntityName = masterEntityName + '_acl'
      aclStorageAlias = (unityEntityMeta.sqlAlias || aclStorageEntityName) + 'acl'
    } else {
      masterEntityName = entityName
      aclStorageEntityName = masterEntityName + '_acl'
      aclStorageAlias = (entityMeta.sqlAlias || aclStorageEntityName) + 'acl'
    }


    if (props.useUnityName) {

    } else {

    }
    // FaclParentEntity := FUnityEntity.name
    // FactEntityAlias := FUnityEntity.sqlAlias + 'acl';
    for (const attr of entityMeta.attributes) {
      if (attr.dataType !== 'Many') continue
      if (domainJson[attr.associationManyData]) continue // many data entity already added
      const addedManyEntity = {
        code: attr.associationManyData,
        name: attr.associationManyData,
        isManyManyRef: true,
        connectionName: entityMeta.connectionName,
        attributes: [{
          name: 'sourceID',
          caption: 'sourceID',
          dataType: 'Entity',
          associatedEntity: entityName,
          cascadeDelete: (entityMeta.mixins && entityMeta.mixins.mStorage && !entityMeta.mixins.mStorage.safeDelete),
          allowNull: false
        }, {
          name: 'destID',
          caption: 'destID',
          dataType: 'Entity',
          associatedEntity: attr.associatedEntity,
          cascadeDelete: attr.cascadeDelete,
          allowNull: false
        }],
        mixins: {
          audit: {
            enabled: (entityMeta.mixins && entityMeta.mixins.audit && entityMeta.mixins.audit.enabled),
            parentIdentifier: 'sourceID',
            parentEntity: entityName
          }
        }
      }
      domainJson[attr.associationManyData] = {
        modelName: domainJson[entityName].modelName,
        meta: addedManyEntity,
        langs: null
      }
    }
  }
}

function throwConfigError(entityName, msg) {
  throw new Error(`Invalid 'aclRls' mixin config for ${entityName}: ${msg}`)
}
