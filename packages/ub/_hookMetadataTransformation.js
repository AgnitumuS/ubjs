module.exports = ubMixinTransformation

const addAclRlsStorageEntities = require('./mixins/aclRlsMetadataHook')
/**
 * This hook is called by server in the single thread initialization mode. In this stage
 *  - native Domain is not created yet
 *  - js files form models is not evaluated
 * Hook can mutate a Domain JSON, for example - adds additional attributes to the entities and lang files, etc
 *
 * @param {object<string, {modelName: string, meta: object, lang: object<string, object>}>} domainJson
 * @param {object} serverConfig
 */
function ubMixinTransformation (domainJson, serverConfig) {
  addManyRefEntities(domainJson, serverConfig)
  addAclRlsStorageEntities(domainJson, serverConfig)
  addImplicitlyAddedMixins(domainJson, serverConfig)
  const mt = serverConfig.security.multitenancy
  if (mt && (mt.enabled === true)) {
    addMultitenancyMixinAttributes(domainJson, serverConfig)
  } else {
    removeMultitenancyMixin(domainJson)
  }
  replaceEnvInMapping(domainJson, serverConfig)
  validateAttributes(domainJson, serverConfig)
}

/**
 * Add implicitlyAddedMixins for each entity where such mixin not disabled
 * @param {object<string, {modelName: string, meta: object, langs: object<string, object>}>} domainJson
 * @param {object} serverConfig
 */
function addImplicitlyAddedMixins (domainJson, serverConfig) {
  const impl = serverConfig.application.domain.implicitlyAddedMixins
  if (!impl.length) return
  console.debug('Adding implicitlyAddedMixins:', serverConfig.application.domain.implicitlyAddedMixins)
  for (const entityName in domainJson) {
    const entityMeta = domainJson[entityName].meta
    if (!entityMeta.mixins) continue
    impl.forEach(mixin4add => {
      if (!entityMeta.mixins[mixin4add]) {
        entityMeta.mixins[mixin4add] = {}
      }
    })
  }
}

/**
 * Add entities for storing data for attributes of type "Many" (`associationManyData`)
 * @param {object<string, {modelName: string, meta: object, langs: object<string, object>}>} domainJson
 * @param {object} serverConfig
 */
function addManyRefEntities (domainJson, serverConfig) {
  for (const entityName in domainJson) {
    const entityMeta = domainJson[entityName].meta
    for (const attr of entityMeta.attributes) {
      if (attr.dataType !== 'Many') continue
      if (domainJson[attr.associationManyData]) continue // many data entity already added
      const addedManyEntity = {
        code: attr.associationManyData,
        name: attr.associationManyData,
        isManyManyRef: true,
        connectionName: entityMeta.connectionName,
        attributes: [{ // virtual ID attribute - just to prevent native code to add an ID attribute and primary key on it
          name: 'ID',
          caption: 'virtualID',
          dataType: 'BigInt',
          mapping: [{
            name: 'AnsiSQL',
            expressionType: 'Expression',
            expression: '[sourceID]*100+[destID]'
          }]
        },
        {
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
          mStorage: {},
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

/**
 * Add mi_tenantID for each entity with multi-tenancy
 * @param {object<string, {modelName: string, meta: object, langs: object<string, object>}>} domainJson
 * @param {object} serverConfig
 */
function addMultitenancyMixinAttributes (domainJson, serverConfig) {
  const dbCfg = serverConfig.application.connections
  const connCfgMap = {}
  let defaultConn
  dbCfg.forEach(c => {
    connCfgMap[c.name] = c
    if (c.isDefault) defaultConn = c
  })
  if (!defaultConn) defaultConn = dbCfg[0]
  for (const entityName in domainJson) {
    const entityMeta = domainJson[entityName].meta
    if (entityMeta.mixins && entityMeta.mixins.multitenancy && entityMeta.mixins.multitenancy.enabled !== false) {
      if ((entityMeta.dsType === 'External' || entityMeta.dsType === 'Virtual') && entityMeta.mixins.multitenancy.enabled !== true) {
        // For Virtual and External dsTypes, default to disabled multitenancy
        entityMeta.mixins.multitenancy.enabled = false
        continue
      }
      if (entityMeta.attributes.indexOf(a => a.name === 'mi_tenantID') !== -1) continue
      const conn = connCfgMap[entityMeta.connectionName] || defaultConn
      if (!conn) throw new Error(`Connection definition not found for entity ${entityName}`)
      let dbDefault
      if (conn.dialect === 'PostgreSQL') {
        dbDefault = "(COALESCE(current_setting('ub.tenantID'::text, true), '0'::text))::bigint"
      } else if (conn.dialect === 'MSSQL2012') {
        dbDefault = "CAST(COALESCE(SESSION_CONTEXT(N'ub.tenantID'), '0') as BigInt)"
      } else if (conn.dialect === 'SQLite3') { // TODO - fts multitenancy

      } else {
        throw new Error(`DB dialect '${conn.dialect}' is not supported by multitenancy mixin for entity ${entityName}`)
      }
      entityMeta.attributes.push({
        name: 'mi_tenantID',
        caption: 'tenantID',
        dataType: 'BigInt',
        allowNull: false,
        readOnly: true,
        defaultView: false,
        restriction: {
          I: 'Admin',
          S: 'Admin',
          replaceBy: '-1',
          U: 'Admin'
        },
        defaultValue: dbDefault
      })
    }
  }
}

/**
 * Disable multitenancy mixin in all entities
 * @param {object<string, {modelName: string, meta: object, lang: object<string, object>}>} domainJson
 */
function removeMultitenancyMixin (domainJson) {
  for (const { meta: entityMeta } of Object.values(domainJson)) {
    if (entityMeta.mixins && entityMeta.mixins.multitenancy) {
      delete entityMeta.mixins.multitenancy
    }
  }
}

/**
 * Check blobStore exists in server config for each Document type attribute
 * Add defaultValue='0' for `Boolean` attributes
 *
 * @param {object<string, {modelName: string, meta: object, lang: object<string, object>}>} domainJson
 * @param {object} serverConfig
 */
function validateAttributes (domainJson, serverConfig) {
  const bsConfig = serverConfig.application.blobStores || []
  const bsSet = new Set(bsConfig.map(c => c.name))
  for (const entityName in domainJson) {
    const entityMeta = domainJson[entityName].meta
    entityMeta.attributes.forEach(attr => {
      if ((attr.dataType === 'Document') && attr.storeName && !bsSet.has(attr.storeName)) {
        throw new Error(`Entity '${entityName}'. Blob store '${attr.storeName}' used by attribute '${attr.name}' ('storeName' property), but such store is not defined in ubConfig`)
      }
      // code below is moved from native on 2022-08-03
      if (attr.dataType === 'Boolean') {
        // original implementation - force allowNull
        // if (!attr.allowNull) attr.allowNull = false
        // new implementation - sets attr.defaultValue to '0' - DDL generator adds notNull constraint for Boolean in any case
        if (!attr.defaultValue) attr.defaultValue = '0'
      }
      // MIII-363: Disable sorting for adtText adtDocument, adtMany
      if (['Text', 'Document', 'Many'].includes(attr.dataType)) {
        attr.allowSort = false
      }
    })
  }
}

/**
 * Replace %ENV||default% macros in entity and attributes mapping
 * @param {object<string, {modelName: string, meta: object, lang: object<string, object>}>} domainJson
 * @param {object} serverConfig
 */
function replaceEnvInMapping (domainJson, serverConfig) {
  const envs = process.env
  function doReplace (content) {
    return content.replace(/%([\w-#.@$]*?)(?:\|\|([\w-#.@$]*?))?%/g, function replacer (match, p1, def) {
      if (envs.hasOwnProperty(p1)) {
        return envs[p1]
      } else {
        return def !== undefined ? def : ''
      }
    })
  }
  for (const entityName in domainJson) {
    const entityMeta = domainJson[entityName].meta
    const m = entityMeta.mapping
    if (m && m.length) {
      m.forEach(v => {
        if (v.selectName) v.selectName = doReplace(v.selectName)
        if (v.execName) v.execName = doReplace(v.execName)
        if (v.pkGenerator) v.pkGenerator = doReplace(v.pkGenerator)
      })
    }
    entityMeta.attributes.forEach(attr => {
      if (attr.mapping && attr.mapping.length) {
        attr.mapping.forEach(m => {
          if (m.expression) m.expression = doReplace(m.expression)
        })
      }
    })
  }
}
