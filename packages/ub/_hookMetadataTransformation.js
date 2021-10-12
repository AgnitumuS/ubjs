module.exports = ubMixinTransformation

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
  addImplicitlyAddedMixins(domainJson, serverConfig)
  const mt = serverConfig.security.multitenancy
  if (mt && (mt.enabled === true)) {
    addMultitenancyMixinAttributes(domainJson, serverConfig)
  }
  validateAttributesBlobStore(domainJson, serverConfig)
  addFtsConnectionEntities(domainJson, serverConfig)
}

/**
 * Add implicitlyAddedMixins for each entity where such mixin not disabled
 * @param {object<string, {modelName: string, meta: object, lang: object<string, object>}>} domainJson
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
 * Add mi_tenantID for each entity with mnltitenancy
 * @param {object<string, {modelName: string, meta: object, lang: object<string, object>}>} domainJson
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
 * check blobStore exists in server config for each Document type attribute
 * @param {object<string, {modelName: string, meta: object, lang: object<string, object>}>} domainJson
 * @param {object} serverConfig
 */
function validateAttributesBlobStore (domainJson, serverConfig) {
  const bsConfig = serverConfig.application.blobStores || []
  const bsSet = new Set(bsConfig.map(c => c.name))
  for (const entityName in domainJson) {
    const entityMeta = domainJson[entityName].meta
    entityMeta.attributes.forEach(attr => {
      if ((attr.dataType === 'Document') && attr.storeName && !bsSet.has(attr.storeName)) {
        throw new Error(`Entity '${entityName}'. Blob store '${attr.storeName}' used by attribute '${attr.name}' ('storeName' property), but such store is not defined in ubConfig`)
      }
    })
  }
}

/**
 * For each connection what used in mixins.fts.connectionName for any entity adds service entities with name fts_${connName}_lang
 * @param {object<string, {modelName: string, meta: object, lang: object<string, object>}>} domainJson
 * @param {object} serverConfig
 */
function addFtsConnectionEntities (domainJson, serverConfig) {
  console.log(domainJson.uba_user)
  const ftsCfg = serverConfig.application.fts
  if (!ftsCfg || (ftsCfg && !ftsCfg.enabled)) return // fts is disabled
  // calc set of the connection names what used as FTS data source
  const ftsConns = new Set()
  for (const entityName in domainJson) {
    const entityMeta = domainJson[entityName].meta
    if (entityMeta.mixins && entityMeta.mixins.fts) {
      ftsConns.add(entityMeta.mixins.fts.connectionName || 'ftsDefault')
    }
  }
  // for each fts connection create a service entity(s)
  for (const connName of ftsConns) {
    const connCfg = serverConfig.application.connections.find(c => c.name === connName)
    if (!connCfg) throw new Error(`Connection '${connName}' wanted by mixins.fts.connectionName of some entity in Domain, but not defined in 'ubConfig.application.connections'`)
    for (const lang of connCfg.supportLang) {
      const wantedServiceEntity = `fts_${connName}_${lang}`
      if (!domainJson[wantedServiceEntity]) {
        domainJson[wantedServiceEntity] = {
          modelName: 'UB',
          meta: {
            name: wantedServiceEntity,
            connectionName: connName,
            isFTSDataTable: true,
            attributes: [
              { name: 'ID', dataType: 'String', size: 64, isUnique: true }, // instance ID
              { name: 'rowid', dataType: 'BigInt' }, // required for SQLite
              { name: 'entity', dataType: 'String', size: 64 }, // entity name for client
              { name: 'ftsentity', dataType: 'String', size: 64 }, // entity name
              { name: 'dy', dataType: 'String', size: 4 }, // year
              { name: 'dm', dataType: 'String', size: 2 }, // month
              { name: 'dd', dataType: 'String', size: 2 }, // day
              { name: 'datacode', dataType: 'String', size: 128 }, // for documents - name of Document attribute
              { name: 'aclrls', dataType: 'String', size: 4000 }, // access control list
              { name: 'entitydescr', dataType: 'String', size: 512 }, // instance description value
              { name: 'databody', dataType: 'String', size: 4000 } // text for indexing
              // {
              //   name: 'snippet',
              //   dataType: 'String',
              //   size: 4000,
              //   mapping: {
              //     name: 'SQLite3',
              //     expressionType: 'Expression',
              //     expression: `snippet(fts_${connName}, '<b>', '</b>', '<b>...</b>', 9)` // 9 is a `databody` field index
              //   }
              // },
              // {
              //   name: 'rank',
              //   dataType: 'Int',
              //   mapping: {
              //     name: 'SQLite3',
              //     expressionType: 'Expression',
              //     expression: `rank(matchinfo(fts_${connName}),1,1,1,1,1,1,1,1,1,1)`
              //   }
              // }
            ],
            mixins: {
              audit: {
                enabled: false
              }
            }
          },
          langs: {}
        }
      } else {
        console.debug(`FTS entity '${wantedServiceEntity}' is already defined`)
      }
      // TODO - attributes for Elastic
    }
  }
}
