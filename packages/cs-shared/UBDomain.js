/* documentation verified by mpv on 2018-03-18 */
const _ = require('lodash')

/**
 * @module UBDomain
 */

/**
 * Database connection config (w/o credential)
 * @typedef {object} DBConnectionConfig
 * @property {string} name
 * @property {string} dialect
 * @property {Array<string>} supportLang
 * @property {string} advSettings database specific settings
 */

/**
 * @classdesc
 * Domain object model (metadata) - in-memory representation of all *.meta files included in the application config.
 *
 * Developer should never create {@link UBDomain} class directly, but instead use a:
 *
 *  - {@link App.domainInfo App.domainInfo} property inside server-side methods
 *  - {@link SyncConnection#getDomainInfo SyncConnection.getDomainInfo} method inside CLI scripts
 *  - `UBConnection.domain` property inside a browser
 *
       // server-side example
       const UB = require('@unitybase/ub')
       const App = UB.App
       let ubaAuditPresent = App.domainInfo.has('uba_audit')

 *
 * @param {object} domainInfo getDomainInfo UB server method result
 * @param {object} domainInfo.domain raw entities collection
 * @param {object} domainInfo.entityMethods entities methods access rights for current user
 * @param {object} domainInfo.models information about domain models
 * @param {object} domainInfo.i18n entities localization to current user language
 * @param {object} domainInfo.forceMIMEConvertors list of registered server-side MIME converters for document type attribute content
 * @class
 */
function UBDomain (domainInfo) {
  let me = this
  let entityCodes = Object.keys(domainInfo.domain)
  let isV4API = (typeof domainInfo.entityMethods === 'undefined')
  /**
   * Map with keys is entity name, value is UBEntity
   * @member {Object<string, UBEntity>}
   */
  this.entities = {}
  /**
   * Connection collection (extended domain only)
   * @member {Array<DBConnectionConfig>}
   */
  this.connections = domainInfo['connections']
  /**
   * Default connection (extended domain only)
   * @member {DBConnectionConfig}
   */
  this.defaultConnection = undefined
  if (this.connections) {
    this.connections.forEach((conn) => {
      if (conn['isDefault']) this.defaultConnection = conn
    })
  }
  for (let i = 0, L = entityCodes.length; i < L; i++) {
    let entityCode = entityCodes[i]
    let entity = domainInfo.domain[entityCode]
    // entity attributes locale can come either as array
    // "attributes": [{"name": "attrCode", ...}, ..]
    // or as object
    // "attributes": {"attrCode": {...}, ..]
    // to be merged correctly transformation to object required
    if (entity.i18n && entity.i18n.attributes && Array.isArray(entity.i18n.attributes)) {
      let attrs = entity.i18n.attributes
      let newAttrs = {}
      for (let k = 0, lL = attrs.length; k < lL; k++) {
        let attr = attrs[k]
        let attrName = attr.name
        if (!attrName) throw new Error('Invalid localization JSON for entity ' + entityCode)
        delete attr['name']
        newAttrs[attrName] = attr
      }
      entity.i18n.attributes = newAttrs
    }
    if (isV4API) {
      me.entities[entityCode] = new UBEntity(
        entity,
        entity.entityMethods || {},
        entity.i18n,
        entityCode,
        me
      )
    } else {
      me.entities[entityCode] = new UBEntity(
        entity,
        domainInfo.entityMethods[entityCode] || {},
        domainInfo.i18n[entityCode],
        entityCode,
        me
      )
    }
  }

  /**
   * Array of models, sorted by the order of loading
   * @member {Array<UBModel>}
   * @private
   */
  this.orderedModels = []

  /**
   * Models collection
   * @member {Object<string, UBModel>}
   */
  this.models = {}
  let modelCodes = Object.keys(domainInfo.models)
  modelCodes.forEach(function (modelCode) {
    let m = domainInfo.models[modelCode]
    me.models[modelCode] = new UBModel(m, modelCode)
    me.orderedModels.push(me.models[modelCode])
  })
  me.orderedModels.sort((a, b) => a.order - b.order)
}

/**
 * Check all provided entity methods are accessible via RLS.
 *
 * If entity does not exist in domain or at last one of provided methods is not accessible - return false
 *
 * @param {string} entityCode
 * @param {String|Array} methodNames
 */
UBDomain.prototype.isEntityMethodsAccessible = function (entityCode, methodNames) {
  let entity = this.entities[entityCode]
  if (!entity) return false
  return Array.isArray(methodNames) ? entity.haveAccessToMethods(methodNames) : entity.haveAccessToMethod(methodNames)
}
/**
 * Get entity by code
 * @param {string} entityCode
 * @param {Boolean} [raiseErrorIfNotExists=true] If `true`(default) and entity does not exists throw error
 * @returns {UBEntity}
 */
UBDomain.prototype.get = function (entityCode, raiseErrorIfNotExists) {
  let result = this.entities[entityCode]
  if ((raiseErrorIfNotExists !== false) && !result) {
    throw new Error('Entity with code "' + entityCode + '" does not exists or not accessible')
  }
  return result
}

/**
 * Check entity present in domain & user has access right for at least one entity method
 * @param {string} entityCode
 * @returns {Boolean}
 */
UBDomain.prototype.has = function (entityCode) {
  return !!this.entities[entityCode]
}

/**
* @callback domainEntitiesIteratorCallback
* @param {UBEntity} entity
* @param {string} entityCode
* @param {Object<string, UBEntity>} entities
*/

/**
 * Iterates over domain entities and invokes `callBack` for each entity.
 * The iteratee is invoked with three arguments: (UBEntity, entityName, UBDomain.entities)
 * @param {domainEntitiesIteratorCallback} cb
 */
UBDomain.prototype.eachEntity = function (cb) {
  return _.forEach(this.entities, cb)
}

/**
 * Filter entities by properties
 * @example
 *
 *      // sessionCachedEntities contains all entities with property cacheType === Session
 *      var sessionCachedEntities = domain.filterEntities({cacheType: 'Session'});
 *
 * @param {Object|Function} predicate Either a function passed to lodash filter or object
 * @returns {Array<UBEntity>}
 */
UBDomain.prototype.filterEntities = function (predicate) {
  if (_.isFunction(predicate)) {
    return _.filter(this.entities, predicate)
  } else {
    return _.filter(this.entities, function (item) {
      let res = true
      for (let prop in predicate) {
        if (predicate.hasOwnProperty(prop)) {
          res = res && (item[prop] === predicate[prop])
        }
      }
      return res
    })
  }
}

/**
 * Possible types of the attributes
 * @readonly
 * @enum
 */
UBDomain.ubDataTypes = {
  /** Small string. _MSSQL: NVARCHAR, ORACLE: NVARCHAR2, POSTGRE: VARCHAR_ */
  String: 'String',
  /** 32-bite Integer. MSSQL: INT, ORACLE: INTEGER, POSTGRE: INTEGER */
  Int: 'Int',
  /** 64-bite Integer. MSSQL: BIGINT, ORACLE: NUMBER(19), POSTGRE: BIGINT */
  BigInt: 'BigInt',
  /** Double. MSSQL: FLOAT, ORACLE: NUMBER(19, 4), POSTGRE: NUMERIC(19, 4) */
  Float: 'Float',
  /** Currency. MSSQL: FLOAT, ORACLE: NUMBER(19, 2), POSTGRE: NUMERIC(19, 2) */
  Currency: 'Currency',
  /** Boolean. MSSQL: TINYINT, ORACLE: NUMBER(1), POSTGRE: SMALLINT */
  Boolean: 'Boolean',
  /** Date + Time in UTC (GMT+0) timezone. MSSQL: DATETIME, OARCLE: DATE, POSTGRE: TIMESTAMP WITH TIME ZONE */
  DateTime: 'DateTime',
  /** Long strint. MSSQL: NVARCHAR(MAX), ORACLE: CLOB, POSTGRE: TEXT */
  Text: 'Text',
  /** Alias for BigInt */
  ID: 'ID',
  /** Reference to enother entity. BigInt */
  Entity: 'Entity',
  /** Store a JSON with information about Document place in blob store */
  Document: 'Document',
  Many: 'Many',
  /**  Seconds since UNIX epoch, Int64. MSSQL: BIGINT, ORACLE: NUMBER(19), POSTGRE: BIGINT */
  TimeLog: 'TimeLog',
  /** Enumertion (see ubm_enum) */
  Enum: 'Enum',
  /** Bynary data. MSSQL: VARBINARY(MAX), ORACLE: BLOB, POSTGRE: BYTEA */
  BLOB: 'BLOB',
  /** Date (without time) in UTC (GMT+0) */
  Date: 'Date'
}

UBDomain.prototype.ubDataTypes = UBDomain.ubDataTypes

/**
 * Types of expressions in attribute mapping
 * @readonly
 * @protected
 * @enum
 */
UBDomain.ExpressionType = {
  Field: 'Field',
  Expression: 'Expression'
}

/**
 * UnityBase base mixins
 * @readonly
 * @private
 * @enum
 */
UBDomain.ubMixins = {
  dataHistory: 'dataHistory',
  mStorage: 'mStorage',
  unity: 'unity',
  treePath: 'treePath'
}

/**
 * Service attribute names
 * @readonly
 * @enum
 */
UBDomain.ubServiceFields = {
  dateFrom: 'mi_datefrom',
  dateTo: 'mi_dateto'
}

/**
 * Entity dataSource types
 * @enum {string}
 * @readonly
 */
UBDomain.EntityDataSourceType = {
  Normal: 'Normal',
  External: 'External',
  System: 'System',
  Virtual: 'Virtual'
}

/**
 * @enum
 */
UBDomain.EntityCacheTypes = {
  None: 'None',
  Entity: 'Entity',
  Session: 'Session',
  SessionEntity: 'SessionEntity'
}

/**
 * Priority to apply a mapping of a attributes/entities to the physical tables depending of connection dialect
 * @enum
 * @protected
 */
UBDomain.dialectsPriority = {
  MSSQL2012: [ 'MSSQL2012', 'MSSQL', 'AnsiSQL' ],
  MSSQL2008: [ 'MSSQL2008', 'MSSQL', 'AnsiSQL' ],
  MSSQL: [ 'MSSQL', 'AnsiSQL' ],
  Oracle11: [ 'Oracle11', 'Oracle', 'AnsiSQL' ],
  Oracle10: [ 'Oracle10', 'Oracle', 'AnsiSQL' ],
  Oracle9: [ 'Oracle9', 'Oracle', 'AnsiSQL' ],
  Oracle: [ 'Oracle', 'AnsiSQL' ],
  PostgreSQL: [ 'PostgreSQL', 'AnsiSQL' ],
  AnsiSQL: [ 'AnsiSQL' ],
  Firebird: [ 'Firebird', 'AnsiSQL' ],
  SQLite3: [ 'SQLite3', 'AnsiSQL' ]
}

/**
 * Return physical type by UBDataType
 * @param {string} dataType
 * @return {string}
 */
UBDomain.getPhysicalDataType = function (dataType) {
  let ubDataTypes = UBDomain.ubDataTypes
  let typeMap = {}

  if (!this.physicalTypeMap) {
    typeMap[ubDataTypes.Int] = 'int'
    typeMap[ubDataTypes.Entity] = 'int'
    typeMap[ubDataTypes.ID] = 'int'
    typeMap[ubDataTypes.BigInt] = 'int'

    typeMap[ubDataTypes.String] = 'string'
    typeMap[ubDataTypes.Text] = 'string'
    typeMap[ubDataTypes.Enum] = 'string'

    typeMap[ubDataTypes.Float] = 'float'
    typeMap[ubDataTypes.Currency] = 'float'

    typeMap[ubDataTypes.Boolean] = 'boolean'

    typeMap[ubDataTypes.Date] = 'date'
    typeMap[ubDataTypes.DateTime] = 'date'

    this.physicalTypeMap = typeMap
  }
  return this.physicalTypeMap[dataType] || 'auto'
}

/**
 * Model (logical group of entities).
 * Instantiated in  {@link UBDomain#models UBDomain.models} and {@link UBDomain#orderedModels UBDomain.orderedModels}
 * @class
 * @param cfg
 * @param cfg.path
 * @param cfg.needInit
 * @param cfg.needLocalize
 * @param cfg.order
 * @param {string} [cfg.moduleName]
 * @param {string} [cfg.moduleSuffix]
 * @param {string} [cfg.clientRequirePath] if passed are used instead of moduleName + moduleSuffix
 * @param {string} [cfg.realPublicPath]
 * @param {string} modelCode
 */
function UBModel (cfg, modelCode) {
  /**
   * Model name as specified in application config
   * @type {string}
   */
  this.name = modelCode
  this.path = cfg.path
  if (cfg.needInit) {
    /**
     * `initModel.js` script is available in the public folder (should be injected by client)
     * @type {boolean}
     */
    this.needInit = cfg.needInit
  }
  if (cfg.needLocalize) {
    /**
     * `locale-Lang.js` script is available in the public folder (should be injected by client)
     * @type {boolean}
     */
    this.needLocalize = cfg.needLocalize
  }
  /**
   * An order of model initialization (as it is provided in server domain config)
   * @type {number}
   */
  this.order = cfg.order
  /**
   * Module name for `require`
   * @type {string}
   */
  this.moduleName = cfg.moduleName
  // if (cfg.moduleSuffix && cfg.moduleName) {
  //   this.moduleName = this.moduleName + '/' + cfg.moduleSuffix
  // }
  /**
   * The path for retrieve a model public accessible files (using clientRequire endpoint)
   * @type {string}
   */
  this.clientRequirePath = /* cfg.clientRequirePath
    ? cfg.clientRequirePath
    : */(cfg.moduleSuffix && cfg.moduleName)
      ? this.moduleName + '/' + cfg.moduleSuffix
      : (this.moduleName || this.path)

  if (cfg.realPublicPath) {
    /**
     * Server-side domain only - the full path to model public folder (if any)
     * @type {string}
     */
    this.realPublicPath = cfg.realPublicPath
  }
  if (cfg.realPath) {
    /**
     * Server-side domain only - the full path to model folder
     * @type {string}
     */
    this.realPath = cfg.realPath
  }
}
UBModel.prototype.needInit = false
UBModel.prototype.needLocalize = false
UBModel.prototype.realPublicPath = ''

/**
 * Collection of attributes
 * @class
 */
function UBEntityAttributes () {}
/**
 * Return a JSON representation of all entity attributes
 * @returns {object}
 */
UBEntityAttributes.prototype.asJSON = function () {
  let result = {}
  _.forEach(this, function (prop, propName) {
    if (prop.asJSON) {
      result[propName] = prop.asJSON()
    } else {
      result[propName] = prop
    }
  })
  return result
}

/** @class */
function UBEntityMapping (maping) {
  /**
   * @type {string}
   */
  this.selectName = maping.selectName || ''
  /** @type {string} */
  this.execName = maping.execName || this.selectName
  /** @type {string} */
  this.pkGenerator = maping.pkGenerator
}

/**
 * Entity metadata
 * @class
 * @param {object} entityInfo
 * @param {object} entityMethods
 * @param {object} i18n
 * @param {string} entityCode
 * @param {UBDomain} domain
 */
function UBEntity (entityInfo, entityMethods, i18n, entityCode, domain) {
  let me = this
  let mixinNames, mixinInfo, i18nMixin, dialectProiority

  if (i18n) {
    _.merge(entityInfo, i18n)
  }
  /**
   * Non enumerable (to prevent JSON.stringify circular ref) read only domain
   * @property {UBDomain} domain
   * @readonly
   */
  Object.defineProperty(this, 'domain', {enumerable: false, value: domain})
  /**
   * @type {string}
   * @readonly
   */
  this.code = entityCode
  /**
   * Entity model name
   * @type{string}
   * @readonly
   */
  this.modelName = entityInfo.modelName
  /**
   * Entity name
   * @type {string}
   * @readonly
   */
  this.name = entityInfo.name

  if (entityInfo.caption) this.caption = entityInfo.caption
  if (entityInfo.description) this.description = entityInfo.description
  if (entityInfo.documentation) this.documentation = entityInfo.documentation
  if (entityInfo.descriptionAttribute) this.descriptionAttribute = entityInfo.descriptionAttribute
  if (entityInfo.cacheType) this.cacheType = entityInfo.cacheType
  if (entityInfo.dsType) this.dsType = entityInfo.dsType
  if (entityInfo.isUnity) this.isUnity = true

  /**
   * Internal short alias
   * @type {string}
   * @readonly
   */
  this.sqlAlias = entityInfo.sqlAlias
  /**
   * Data source connection name
   * @type {string}
   * @readonly
   */
  this.connectionName = entityInfo.connectionName
  /**
   * This is a Full Text Search entity
   * @type {boolean}
   */
  this.isFTSDataTable = entityInfo.isFTSDataTable === true

  /**
   * Reference to connection definition (for extended domain only)
   * @type {DBConnectionConfig}
   * @readonly
   */
  this.connectionConfig = (this.connectionName && this.domain.connections) ? _.find(this.domain.connections, {name: this.connectionName}) : undefined
  /**
   * Optional mapping of entity to physical data (for extended domain info only).
   * Calculated from a entity mapping collection in accordance with application connection configuration
   * @type {UBEntityMapping}
   * @readonly
   */
  this.mapping = undefined
  if (entityInfo.mapping) {
    let mappingKeys = Object.keys(entityInfo.mapping)
    mappingKeys.forEach(key => {
      if (!UBDomain.dialectsPriority[key]) throw new Error(`Invalid dialect ${key} in ${this.code} mapping`)
    })
    if (mappingKeys.length) {
      let me = this
      dialectProiority = UBDomain.dialectsPriority[this.connectionConfig.dialect]
      _.forEach(dialectProiority, function (dialect) {
        if (entityInfo.mapping[dialect]) {
          me.mapping = new UBEntityMapping(entityInfo.mapping[dialect])
          return false
        }
      })
    }
  }

  /**
   * Optional dbKeys (for extended domain info)
   * @type {object}
   */
  this.dbKeys = entityInfo.dbKeys && Object.keys(entityInfo.dbKeys).length ? entityInfo.dbKeys : undefined
  /**
   * Optional dbExtensions (for extended domain info)
   * @type {object}
   */
  this.dbExtensions = entityInfo.dbExtensions && Object.keys(entityInfo.dbExtensions).length ? entityInfo.dbExtensions : undefined

  /**
   * Entity attributes collection
   * @type {Object<string, UBEntityAttribute>}
   */
  this.attributes = new UBEntityAttributes()
  /**
   * Slice of attributes with type `Document`
   * @type {Array<UBEntityAttribute>}
   */
  this.blobAttributes = []

  _.forEach(entityInfo.attributes, (attributeInfo, attributeCode) => {
    let attr = new UBEntityAttribute(attributeInfo, attributeCode, me)
    // record history mixin set a dateTo automatically, so let's allow blank mi_dateTo on UI
    // but for DDL generator mi_dateTo must be not null, so change only for browser side
    if ((attr.code === 'mi_dateTo') && (typeof window !== 'undefined')) {
      attr.allowNull = true
    }
    me.attributes[attributeCode] = attr
    if (attr.dataType === UBDomain.ubDataTypes.Document) {
      this.blobAttributes.push(attr)
    }
  })

  mixinNames = Object.keys(entityInfo.mixins || {})
  /**
   * Collection of entity mixins
   * @type {Object<string, UBEntityMixin>}
   */
  this.mixins = {}
  mixinNames.forEach(function (mixinCode) {
    mixinInfo = entityInfo.mixins[mixinCode]
    i18nMixin = (i18n && i18n.mixins ? i18n.mixins[mixinCode] : null)
    switch (mixinCode) {
      case 'mStorage':
        me.mixins[mixinCode] = new UBEntityStoreMixin(mixinInfo, i18nMixin, mixinCode)
        break
      case 'dataHistory':
        me.mixins[mixinCode] = new UBEntityHistoryMixin(mixinInfo, i18nMixin, mixinCode)
        break
      case 'aclRls':
        me.mixins[mixinCode] = new UBEntityAclRlsMixin(mixinInfo, i18nMixin, mixinCode)
        break
      case 'fts':
        me.mixins[mixinCode] = new UBEntityFtsMixin(mixinInfo, i18nMixin, mixinCode)
        break
      case 'als':
        me.mixins[mixinCode] = new UBEntityAlsMixin(mixinInfo, i18nMixin, mixinCode)
        break
      default:
        me.mixins[mixinCode] = new UBEntityMixin(mixinInfo, i18nMixin, mixinCode)
    }
  })
  /**
   * Entity methods, allowed for current logged-in user in format {method1: 1, method2: 1}. 1 mean method is allowed
   * Empty for server-side domain - use `entity.haveAccessToMethod` to check method is accessible for user.
   * @type {Object<string, Number>}
   * @readOnly
   */
  this.entityMethods = entityMethods || {}
}

/**
 * Entity caption
 * @type {string}
 */
UBEntity.prototype.caption = ''
/**
 * Entity description
 * @type {string}
 */
UBEntity.prototype.description = ''
/**
 * Documentation
 * @type {string}
 */
UBEntity.prototype.documentation = ''
/**
 * Name of attribute witch used as a display value in lookup
 * @type {string}
 */
UBEntity.prototype.descriptionAttribute = ''

/**
 * Indicate how entity content is cached on the client side.
 *
 * @type {UBDomain.EntityCacheTypes}
 * @readonly
 */
UBEntity.prototype.cacheType = 'None'

/**
 *
 * @type {UBDomain.EntityDataSourceType}
 */
UBEntity.prototype.dsType = 'Normal'

/**
 * Indicate this entity is a UNITY for someone
 * @type {boolean}
 */
UBEntity.prototype.isUnity = false
/**
 * Return an entity caption to display on UI
 * @returns {string}
 */
UBEntity.prototype.getEntityCaption = function () {
  return this.caption || this.description
}

/**
 * Get entity attribute by code. Return `undefined` if attribute is not found
 * @param {string} attributeCode
 * @param {Boolean} [simpleOnly=false] Check for complex attributes like `attr1.attr2.attr3`
 * @returns {UBEntityAttribute}
 */
UBEntity.prototype.attr = function (attributeCode, simpleOnly) {
  let res = this.attributes[attributeCode]
  if (!res && !simpleOnly) {
    res = this.getEntityAttribute(attributeCode)
  }
  return res
}

/**
 * Get entity attribute by code. Throw error if attribute is not found.
 * @param attributeCode
 * @returns {UBEntityAttribute}
 */
UBEntity.prototype.getAttribute = function (attributeCode) {
  let attr = this.attributes[attributeCode]
  if (!attr) {
    throw new Error(`Attribute ${this.code}.${attributeCode} doesn't exist`)
  }
  return attr
}

/**
 * @callback entityAttributesIteratorCallback
 * @param {UBEntityAttribute} attribute
 * @param {string} [attributeName]
 * @param {UBEntityAttributes} [attributes]
 */

/**
 * Iterates over entity attributes.
 * The iteratee is invoked with three arguments: (UBEntityAttribute, attributeName, UBEntityAttributes)
 * @param {entityAttributesIteratorCallback} callBack
 */
UBEntity.prototype.eachAttribute = function (callBack) {
  return _.forEach(this.attributes, callBack)
}

/**
 * Get entity mixin by code. Returns `undefined` if mixin is not found
 * @param {string} mixinCode
 * @returns {UBEntityMixin}
 */
UBEntity.prototype.mixin = function (mixinCode) {
  return this.mixins[mixinCode]
}

/**
 * Checks if entity has enabled mixin with specified code.
 * @param {string} mixinCode
 * @returns {Boolean}
 */
UBEntity.prototype.hasMixin = function (mixinCode) {
  let mixin = this.mixins[mixinCode]
  if (mixinCode === 'audit') {
    return !mixin || (!!mixin && mixin.enabled)
  }
  return (!!mixin && mixin.enabled)
}

/**
 * Checks if entity has mixin. Throw if mixin dose not exist or not enabled
 * @param {string} mixinCode
 */
UBEntity.prototype.checkMixin = function (mixinCode) {
  if (!this.hasMixin(mixinCode)) {
    throw new Error('Entity ' + this.code + ' does not have mixin ' + mixinCode)
  }
}

UBEntity.prototype.asJSON = function () {
  let result = { code: this.code }
  _.forEach(this, function (prop, propName) {
    if (propName === 'domain') {
      return
    }
    if (prop.asJSON) {
      result[propName] = prop.asJSON()
    } else {
      result[propName] = prop
    }
  })
  return result
}

/**
 * Checks if current user has access to specified entity method
 * @param {string} methodCode
 * @returns {Boolean}
 */
UBEntity.prototype.haveAccessToMethod = function (methodCode) {
  return (UB.isServer && process.isServer)
    ? App.els(this.code, methodCode)
    : this.entityMethods[methodCode] === 1
}

/**
 * Filters attributes by properties
 * @param {Object|Function} predicate
 * @returns {Array<UBEntityAttribute>}
 * @example
 *
 *   // return all attributes where property dataType equal Document
 *   domain.get('uba_user').filterAttribute({dataType: 'Document'});
 *
 */
UBEntity.prototype.filterAttribute = function (predicate) {
  if (_.isFunction(predicate)) {
    return _.filter(this.attributes, predicate)
  } else {
    return _.filter(this.attributes, function (item) {
      let res = true
      for (let prop in predicate) {
        if (predicate.hasOwnProperty(prop)) {
          res = res && (item[prop] === predicate[prop])
        }
      }
      return res
    })
  }
}

/**
 * Checks if current user has access to at last one of specified methods
 * @param {Array<string>} methodsCodes
 * @returns {boolean}
 */
UBEntity.prototype.haveAccessToAnyMethods = function (methodsCodes) {
  let me = this
  let fMethods = methodsCodes || []
  let result = false

  fMethods.forEach(function (methodCode) {
    if (UB.isServer && process.isServer) {
      result = result || App.els(me.code, methodCode)
    } else {
      result = result || me.entityMethods[ methodCode ] === 1
    }
  })
  return result
}

/**
 * Checks if current user has access to ALL of the specified methods
 * @param {Array<string>} methods Method names
 * @returns {Boolean}
 */
UBEntity.prototype.haveAccessToMethods = function (methods) {
  let me = this
  let result = true
  let fMethods = methods || []

  fMethods.forEach(function (methodCode) {
    if (UB.isServer && process.isServer) {
      result = result && App.els(me.code, methodCode)
    } else {
      result = result && (me.entityMethods[ methodCode ] === 1)
    }
  })
  return result
}

/**
 * Add entity level method. Client can call such methods remotely. Also such methods are the subjects of ELS.
 *
 * Property named `methodName` with a type `function` should be added to the entity namespace.
 * Such functions accept single parameter of type {@link ubMethodParams}
 *
 * Don't add methods what do not called from client using {@UBEntity#addMethod}!
 *
 * **Warning:** do not call UBEntity.addMethod from inside function or conditions.
 * This code evaluated during thread initialization and each thread must add method in the same manner.
 *
 * @example
 *
  //consider entity with code `my_entity` exists. Inside my_entity.js file):
  var me = my_entity;
  me.entity.addMethod('externalMethod');
  // @param {ubMethodParams} ctx <- here must be JSDoc comment format
  me.externalMethod = function (ctx) {
    let params = ctx.mParams
    let a = params.a || 1
    let b = params.b || 1
    params.multiplyResult = a*b
  }

  // now from client side you can call
  $App.connection.query({entity: 'my_entity', method: 'externalMethod', a: 10, b:20}).then(function(result){
    console.log(' 10 * 20 = ', result.multiplyResult); // will put to log "10 * 20 = 200"
  })

 * @param {string} methodName
 */
UBEntity.prototype.addMethod = function (methodName) {
  throw new Error('UBEntity.addMethod implemented only in HTTP worker thread')
}

/**
 * Convert UnityBase server dateTime response to Date object
 * @private
 * @param value
 * @returns {Date}
 */
function iso8601Parse (value) {
  return value ? new Date(value) : null
}

/**
 * Convert UnityBase server date response to Date object.
 * date response is a day with 00 time (2015-07-17T00:00Z), to get a real date we must add current timezone shift
 * @private
 * @param value
 * @returns {Date}
 */
function iso8601ParseAsDate (value) {
  let res = value ? new Date(value) : null
  if (res) {
    res.setTime(res.getTime() + res.getTimezoneOffset() * 60 * 1000)
  }
  return res
}

/**
 * Convert UnityBase server Boolean response to Boolean (0 = false & 1 = true)
 * @private
 * @param v Value to convert
 * @returns {Boolean|null}
 */
function booleanParse (v) {
  if (typeof v === 'boolean') {
    return v
  }
  if ((v === undefined || v === null || v === '')) {
    return null
  }
  return (v === 1) || (v === '1')
}

/**
 * Return array of conversion rules for raw server response data
 * @param {Array<string>} fieldList
 * @returns {Array<{index: number, convertFn: function}>}
 */
UBEntity.prototype.getConvertRules = function (fieldList) {
  let me = this
  let rules = []
  let types = UBDomain.ubDataTypes

  fieldList.forEach(function (fieldName, index) {
    let attribute = me.attr(fieldName)
    if (attribute) {
      if (attribute.dataType === types.DateTime) {
        rules.push({
          index: index,
          convertFn: iso8601Parse
        })
      } else if (attribute.dataType === types.Date) {
        rules.push({
          index: index,
          convertFn: iso8601ParseAsDate
        })
      } else if (attribute.dataType === types.Boolean) {
        rules.push({
          index: index,
          convertFn: booleanParse
        })
      }
    }
  })
  return rules
}

/**
 * Returns description attribute name (`descriptionAttribute` metadata property)
 * If `descriptionAttribute` is empty - fallback to attribute with code `caption`
 * @return {string}
 */
UBEntity.prototype.getDescriptionAttribute = function () {
  let result = this.descriptionAttribute || 'caption'
  if (!this.attr(result)) {
    throw new Error('Missing description attribute for entity ' + this.code)
  }
  return result
}

/**
 * Returns information about attribute and attribute entity. Understand complex attributes like firmID.firmType.code
 * @param {string} attributeName
 * @param {number} [depth=0] If 0 - last, -1 - before last, > 0 - root. Default 0.
 * @return {{ entity: String, attribute: UBEntityAttribute, attributeCode: String }|undefined}
 */
UBEntity.prototype.getEntityAttributeInfo = function (attributeName, depth) {
  let domainEntity = this
  let attributeNameParts = attributeName.split('.')
  let currentLevel = -(attributeNameParts.length - 1)
  let complexAttr = []
  let currentEntity = this.code
  /** @type UBEntityAttribute */
  let attribute
  let key

  if (depth && depth > 0) {
    return { entity: currentEntity, attribute: domainEntity.attr(attributeNameParts[0]), attributeCode: attributeNameParts[0] }
  }

  while (domainEntity && attributeNameParts.length) {
    if (domainEntity && attributeNameParts.length === 1) {
      complexAttr = attributeNameParts[0].split('@')
      if (complexAttr.length > 1) {
        domainEntity = this.domain.get(complexAttr[1]) // real entity is text after @
        attributeName = complexAttr[0]
      }
      return { entity: currentEntity, attribute: domainEntity.attr(attributeName), attributeCode: attributeName }
    }
    key = attributeNameParts.shift()
    complexAttr = key.split('@')
    if (complexAttr.length > 1) {
      currentEntity = complexAttr[1]
      domainEntity = this.domain.get(currentEntity) // real entity is text after @
      key = complexAttr[0]
    }
    attribute = domainEntity.attr(key)
    if (attribute) { // check that attribute exists in domainEntity
      if (currentLevel === (depth || 0)) {
        return { entity: currentEntity, attribute: attribute, attributeCode: key }
      }
      attributeName = attributeNameParts[0]
      if (attribute.dataType === 'Enum' && attributeName === 'name') {
        return { entity: currentEntity, attribute: attribute, attributeCode: key }
      } else {
        currentEntity = attribute.associatedEntity
        domainEntity = attribute.getAssociatedEntity()
      }
    } else {
      return undefined
    }
    currentLevel += 1
  }
  return undefined
}

/**
 * Returns entity attribute. Understand complex attributes like firmID.firmType.code
 * @param {string} attributeName
 * @param {number} [recDepth=0] Current recursion depth. If 0 - last, -1 - before last, > 0 - root. Default 0.
 * @return {UBEntityAttribute}
 */
UBEntity.prototype.getEntityAttribute = function (attributeName, recDepth) {
  let domainEntity = this
  let attributeNameParts = attributeName.split('.')
  let currentLevel = -(attributeNameParts.length - 1)
  let complexAttr = []
  let attribute
  let key

  if (recDepth && recDepth > 0) {
    return domainEntity.attributes[attributeNameParts[0]]
  }

  // TODO: Make the same thing for other special chars (except @)
  while (domainEntity && attributeNameParts.length) {
    if (domainEntity && attributeNameParts.length === 1) {
      complexAttr = attributeNameParts[0].split('@')
      if (complexAttr.length > 1) {
        domainEntity = this.domain.get(complexAttr[1]) // real entity is text after @
        attributeName = complexAttr[0]
      }
      return domainEntity.attributes[attributeName]
    }
    key = attributeNameParts.shift()
    complexAttr = key.split('@')
    if (complexAttr.length > 1) {
      domainEntity = this.domain.get(complexAttr[1]) // real entity is text after @
      key = complexAttr[0]
    }
    attribute = domainEntity.attributes[key]
    if (attribute) { // check that attribute exists in domainEntity
      if (currentLevel === (recDepth || 0)) {
        return attribute
      }
      attributeName = attributeNameParts[0]
      if (attribute.dataType === UBDomain.ubDataTypes.Enum) {
        if (attributeName === 'name') { // WTF?
          return attribute
        } else {
          domainEntity = this.domain.get('ubm_enum')
        }
      } else {
        domainEntity = this.domain.get(attribute.associatedEntity)
      }
    } else {
      return undefined
    }
    currentLevel += 1
  }
  return undefined
}

/**
 * Returns array of entity attribute`s names
 * @param {Object|Function} [predicate] In empty - will return all names
 * @returns {Array<string>}
 */
UBEntity.prototype.getAttributeNames = function (predicate) {
  let attributes = []
  if (predicate) {
    _.forEach(this.filterAttribute(predicate), function (attr) {
      attributes.push(attr.code)
    })
    return attributes
  } else {
    return Object.keys(this.attributes)
  }
}

/**
 * For each attribute from `fieldList` chck it's type, and if this type is Entity - add entity code to then result
 * @param {Array<string>} [fieldList] If empty - all entity attributes will be used
 * @return {Array<string>}
 */
UBEntity.prototype.getEntityRequirements = function (fieldList) {
  let result = []
  fieldList = fieldList || this.getAttributeNames()
  for (let i = 0, L = fieldList.length; i < L; ++i) {
    let fieldNameParts = fieldList[i].split('.')
    let attr = this.getEntityAttribute(fieldNameParts[0])
    if (attr.dataType === UBDomain.ubDataTypes.Entity) {
      if (fieldNameParts.length > 1) {
        let tail = [fieldNameParts.slice(1).join('.')]
        result = _.union(result, attr.getAssociatedEntity().getEntityRequirements(tail))
      } else {
        result = _.union(result, [attr.associatedEntity])
      }
    }
  }
  return result
}

/**
 * Checks entity has attribute(s) and throw error if not
 * @param {String|Array<string>} attributeName
 * @param {string} contextMessage
 */
UBEntity.prototype.checkAttributeExist = function (attributeName, contextMessage) {
  let me = this
  attributeName = !_.isArray(attributeName) ? [attributeName] : attributeName
  _.forEach(attributeName, function (fieldName) {
    if (!me.getEntityAttributeInfo(fieldName)) {
      throw new Error(contextMessage + (contextMessage ? ' ' : '') +
            'The entity "' + me.code + '" does not have attribute "' + fieldName + '"')
    }
  })
}

/**
 * Return entity description
 * @returns {string}
 */
UBEntity.prototype.getEntityDescription = function () {
  return this.description || this.caption
}

/**
 * @class
 */
function UBEntityAttributeMapping (maping) {
  /**
   * @type {UBDomain.ExpressionType}
   */
  this.expressionType = maping.expressionType
  /** @type {string} */
  this.expression = maping.expression
}

/**
 * Entity attribute
 * @param {object} attributeInfo
 * @param {string} attributeCode
 * @param {UBEntity} entity
 * @class
 */
function UBEntityAttribute (attributeInfo, attributeCode, entity) {
  // i18n already merged by entity constructor
  /**
   * @type {string}
   * @readonly
   */
  this.code = attributeCode
  /** @type {string}
  * @readonly
  */
  this.name = attributeInfo.name
  /**
   * Non enumerable (to prevent JSON.stringify circular ref) read only entity reference
   * @property {UBEntity} entity
   * @readonly
   */
  Object.defineProperty(this, 'entity', {enumerable: false, value: entity})
  /**
   * Data type
   * @type {UBDomain.ubDataTypes}
   * @readonly
   */
  this.dataType = attributeInfo.dataType || 'String'
  /**
   * Name of entity referenced by the attribute (for attributes of type `Many` - entity name from the AssociationManyData)
   * @type {string}
   * @readonly
   */
  this.associatedEntity = attributeInfo.associatedEntity
  /**
   * @type {string}
   * @readonly
   */
  this.associationAttr = attributeInfo.associationAttr
  /**
   * @type {string}
   * @readonly
   */
  this.caption = attributeInfo.caption || ''
  /**
   * @type {string}
   * @readonly
   */
  this.description = attributeInfo.description || ''
  /**
   * @type {string}
   * @readonly
   */
  this.documentation = attributeInfo.documentation || ''
  /**
   * @type {number}
   * @readonly
   */
  this.size = attributeInfo.size || 0
  /**
   * Attribute value can be empty or null
   * @type {boolean}
   * @readonly
   */
  this.allowNull = (attributeInfo.allowNull !== false)
  /**
   * Allow order by clause by this attribute
   * @type {boolean}
   * @readonly
   */
  this.allowSort = (attributeInfo.allowSort !== false)
  /**
   * @type {boolean}
   * @readonly
   */
  this.isUnique = (attributeInfo.isUnique === true)
  /**
   * @type{string}
   * @readonly
   */
  this.defaultValue = attributeInfo.defaultValue
  /**
   * Edition allowed (not verified by server side)
   * @type {Boolean}
   * @readonly
   */
  this.readOnly = (attributeInfo.readOnly === true)
  /**
   * @property {Boolean}
   * @readonly
   */
  this.isMultiLang = (attributeInfo.isMultiLang === true)
  /**
   * For attributes of type Entity enable cascade deletion on application server level (not on database level)
   * @type {Boolean}
   * @readonly
   */
  this.cascadeDelete = (attributeInfo.cascadeDelete === true)
  /**
   * For attributes of type Enum - code of enumeration group from `ubm_enum.eGroup`
   * @property {string} enumGroup
   * @readonly
   */
  this.enumGroup = attributeInfo.enumGroup
  /**
   * @type {object}
   * @readonly
   */
  this.customSettings = attributeInfo.customSettings || {}
  /**
   * For attributes of type Many - name of the many-to-many table. UB create system entity with this name and generate table during DDL generation
   * @property {string}
   * @readonly
   */
  this.associationManyData = attributeInfo.associationManyData
  /**
   * For attributes of type Document - name of BLOB store from application `storeConfig`. If empty - default store will be used
   * @type {string}
   * @readonly
   */
  this.storeName = attributeInfo.storeName
  /**
   * For attributes of type Entity. If `false` - bypass foreign key generation by DDL generator
   * @type {boolean}
   */
  this.generateFK = attributeInfo.generateFK !== false
  /**
   * If `true` - client should shows this attribute in auto-build forms and in '*' select fields
   * @type {boolean}
   */
  this.defaultView = attributeInfo.defaultView !== false
  /**
   * Optional mapping of attribute to physical data (for extended domain info only).
   * Calculated from a entity mapping collection in accordance with application connection configuration
   * @type {UBEntityAttributeMapping}
   * @readonly
   */
  this.mapping = undefined

  if (attributeInfo.mapping) {
    let me = this
    let mappingKeys = Object.keys(attributeInfo.mapping)
    mappingKeys.forEach(function (key) {
      if (!UBDomain.dialectsPriority[key]) throw new Error(`Invalid dialect ${key} in ${entity.code}.${me.code} mapping`)
    })
    if (mappingKeys.length) {
      let dialectsPriority = UBDomain.dialectsPriority[this.entity.connectionConfig.dialect]
      _.forEach(dialectsPriority, function (dialect) {
        if (attributeInfo.mapping[dialect]) {
          me.mapping = new UBEntityAttributeMapping(attributeInfo.mapping[dialect])
          return false // break loop
        }
      })
    }
  }

  /**
   * @property {string} physicalDataType
   * @readonly
   */
  this.physicalDataType = UBDomain.getPhysicalDataType(this.dataType || 'String')
}

/**
 * Return associated entity or `null` if type of attribute !==`Entity`.
 * @returns {UBEntity}
 */
UBEntityAttribute.prototype.getAssociatedEntity = function () {
  return this.associatedEntity ? this.entity.domain.get(this.associatedEntity) : null
}

UBEntityAttribute.prototype.asJSON = function () {
  let result = {}
  _.forEach(this, function (prop, propName) {
    if (propName === 'entity') {
      return
    }
    if (prop.asJSON) {
      result[propName] = prop.asJSON()
    } else {
      result[propName] = prop
    }
  })
  return result
}

/**
 * Contains all properties defined in mixin section of a entity meta file
 * @class
 * @protected
 * @param {object} mixinInfo
 * @param {object} i18n
 * @param {string} mixinCode
 */
function UBEntityMixin (mixinInfo, i18n, mixinCode) {
  /**
   * Mixin code
   * @type {string}
   */
  this.code = mixinCode
  _.assign(this, mixinInfo)
  if (i18n) {
    _.assign(this, i18n)
  }
}

/**
 * Is mixin enabled
 * @type {boolean}
 */
UBEntityMixin.prototype.enabled = true

/**
 * Mixin for persisting entity to a database
 * @class
 * @extends UBEntityMixin
 * @param mixinInfo
 * @param i18n
 * @param mixinCode
 */
function UBEntityStoreMixin (mixinInfo, i18n, mixinCode) {
  UBEntityMixin.apply(this, arguments)
}
UBEntityStoreMixin.prototype = Object.create(UBEntityMixin.prototype)
UBEntityStoreMixin.prototype.constructor = UBEntityStoreMixin
// defaults
/**
 * Is `simpleAudit` enabled
 * @type {boolean}
 */
UBEntityStoreMixin.prototype.simpleAudit = false
/**
 * Use a soft delete
 * @type {boolean}
 */
UBEntityStoreMixin.prototype.safeDelete = false

/**
 * Historical data storage mixin
 * @class
 * @extends UBEntityMixin
 * @param mixinInfo
 * @param i18n
 * @param mixinCode
 * @constructor
 */
function UBEntityHistoryMixin (mixinInfo, i18n, mixinCode) {
  UBEntityMixin.apply(this, arguments)
}
UBEntityHistoryMixin.prototype = Object.create(UBEntityMixin.prototype)
UBEntityHistoryMixin.prototype.constructor = UBEntityHistoryMixin
/**
 * A history storage strategy
 * @type {string}
 */
UBEntityHistoryMixin.prototype.historyType = 'common'
/**
 * Access control list mixin
 * @class
 * @extends UBEntityMixin
 * @param mixinInfo
 * @param i18n
 * @param mixinCode
 */
function UBEntityAclRlsMixin (mixinInfo, i18n, mixinCode) {
  UBEntityMixin.apply(this, arguments)
}
UBEntityAclRlsMixin.prototype = Object.create(UBEntityMixin.prototype)
UBEntityAclRlsMixin.prototype.constructor = UBEntityAclRlsMixin
// defaults
UBEntityAclRlsMixin.prototype.aclRlsUseUnityName = false
UBEntityAclRlsMixin.prototype.aclRlsSelectionRule = 'exists'

/**
 * Full text search mixin
 * @class
 * @extends UBEntityMixin
 * @param mixinInfo
 * @param i18n
 * @param mixinCode
 */
function UBEntityFtsMixin (mixinInfo, i18n, mixinCode) {
  UBEntityMixin.apply(this, arguments)
}
UBEntityFtsMixin.prototype = Object.create(UBEntityMixin.prototype)
UBEntityFtsMixin.prototype.constructor = UBEntityFtsMixin
/**
 * scope
 * @type {string}
 */
UBEntityFtsMixin.prototype.scope = 'connection' // sConnection
/**
 * Data provider type
 * @type {string}
 */
UBEntityFtsMixin.prototype.dataProvider = 'mixin'// dcMixin
/**
 * Attribute level security mixin
 * @param mixinInfo
 * @param i18n
 * @param mixinCode
 * @constructor
 * @extends UBEntityMixin
 */
function UBEntityAlsMixin (mixinInfo, i18n, mixinCode) {
  UBEntityMixin.apply(this, arguments)
}
UBEntityAlsMixin.prototype = Object.create(UBEntityMixin.prototype)
UBEntityAlsMixin.prototype.constructor = UBEntityAlsMixin
/**
 * Is optimistic
 * @type {boolean}
 */
UBEntityAlsMixin.prototype.alsOptimistic = true

UBDomain.UBEntity = UBEntity
UBDomain.UBModel = UBModel
UBDomain.UBEntity.UBEntityAttribute = UBEntityAttribute

module.exports = UBDomain
