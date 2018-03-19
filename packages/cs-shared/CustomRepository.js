/*
 * Ancestor for client-side & server-side repositories
 * @author pavel.mash 23.09.2014
 * documentation verified by mpv on 2018-03-18
 */

// ***********   !!!!WARNING!!!!! **********************
// Module shared between server and client code
const _ = require('lodash')
const bracketsRe = /\[.*]/
// in case values for where is null we transform condition to allowed null comparison with warning.
// If condition not in conditionInCaseValueIsNull object keys we raise error
const conditionInCaseValueIsNull = {equal: 'isNull', notEqual: 'notIsNull', custom: 'custom'}

const cNames = []
for (let i = 0; i < 100; i++) {
  cNames.push(`c${i}`)
}

/**
 * Base data access class for server-side, client(browser)-side and client(console) side Repositories.
 * Usually used via UB.Repository fabric function.
 *
 * Do not use it directly, use {@link UB.Repository UB.Repository} on server side
 */
class CustomRepository {
  /**
   * @param {string} entityName name of Entity we create for
   */
  constructor (entityName) {
    /**
     * @private
     * @type {Array}
     */
    this.fieldList = []
    /**
     * @private
     * @type {Array}
     */
    this.groupList = []
    /**
     * @private
     * @type {{}}
     */
    this.whereList = {}
    /**
     * Used internaly to avoid Object.keys(whereList) call
     * @type {number}
     * @private
     */
    this._whereLength = 0
    /**
     * @private
     * @type {Array}
     */
    this.logicalPredicates = []
    /**
     * @private
     * @type {Array}
     */
    this.joinAs = []
    /**
     * @private
     * @type {Array}
     */
    this.orderList = []
    /**
     * @private
     * @type {Object}
     */
    this.options = {}

    /**
     * Name of entity method used for data retrieve.
     * Default is 'select'. The correct way to set method is `.using('mySelect')`
     * @type {string}
     * @private
     */
    this.method = 'select'

    /**
     * Miscellaneous options
     * @property {Object} __misc
     * @private
     */
    this.__misc = {}

    this.entityName = entityName
  }
  /**
   * Retrieve a data from server using `methodName` entity method.
   * By default `select` method will be used.
   * @param {string} methodName
   */
  using (methodName) {
    this.method = methodName
    return this
  }

  /**
   * Adds attribute.
   * Duplicate is not checked and caller will get server exception.
   *
   *      UB.Repository('tri_srf_reg').attrs('ID').attrs(['code', 'name']).attrs('fullName', 'newCode');
   *
   * Can take expression as a field. In this case entity attribute name must be wrapped into [] brackets.
   * In case of client-side execution the only valid expression is one of:
   *
   * - **'SUM', 'COUNT', 'AVG', 'MAX', 'MIN', 'CAST', 'COALESCE'**
   *
   * @example

   // calculate sum of document payments
   UB.Repository('tri_srf_reg').attrs('SUM([payment])').where('documentID', '=', value)

   // In case of server-side execution any valid SQL expression is accepted:
   UB.Repository('uba_user').attrs('[ID] / 100 + 1').selectAsArray()

   * @param {string|Array<string>} attr
   * @return {CustomRepository}
   */
  attrs (attr) {
    const L = arguments.length
    for (let i = 0; i < L; i++) {
      let attrI = arguments[i]
      if (Array.isArray(attrI)) {
        this.fieldList = this.fieldList.concat(attrI)
      } else {
        this.fieldList.push(attrI)
      }
    }
    return this
  }

  /**
   * Adds where expression
   *
   *  - the expression may contain one of the following functions: 'SUM', 'COUNT', 'AVG', 'MAX', 'MIN', 'CAST', 'COALESCE',
   *    'LENGTH', 'LOWER', 'UPPER', 'DAY', 'MONTH', 'YEAR', 'ROUND', 'FLOOR', 'CEILING'
   *
   *  - for a Date/DateTime attributes special macros `#maxdate` or `#currentdate` can be used as a value:
   *
   *      .where('dateValue', '=', '#maxdate')
   *      .where('dateTimeValue', '<', '#currentdate')
   *
   *  - `in` and 'notIn` conditions can take a sub-repository as a values parameter value.
   *  See {@link CustomRepository#exists} for sample
   *
   * @example

  UB.Repository('my_entity').attrs('id')
    // code in ('1', '2', '3')
    .where('code', 'in', ['1', '2', '3'])
    // code in (select code from my_codes where id = 10)
    .where('code', 'in', UB.Repository('my_codes').attr('code').where('ID', '<', 10)
    // name like '%homer%'
    .where('[name]', 'contains', 'Homer').
    //(birtday >= '2012-01-01') AND (birtday <= '2012-01-02')
    .where('[birtday]', 'geq', new Date()).where('birtday', 'leq', new Date() + 10)
    // (age + 10 >= 15)
    .where('[age] -10', '>=', {age: 15}, 'byAge')
    .where('LENGTH([code]), '<', 5)
    // for condition match expression not need
    .where('', 'match', 'myvalue')

   * @param {string} expression   Attribute name (with or without []) or valid expression with attributes in []
   * @param {CustomRepository.WhereCondition|String} condition  Any value from {@link CustomRepository#WhereCondition WhereCondition}
   * @param {*} [values] Condition value. If `undefined` values not passed to ubql
   * @param {string} [clauseName] Optional clause name to be used in {CustomRepository.logicalPredicates}
   *   If not passed where will generate unique clause named 'c1', 'c2', ......
   * @return {CustomRepository}
   */
  where (expression, condition, values, clauseName) {
    let subQueryType
    if (!clauseName) { // generate unique clause name
      clauseName = cNames[++this._whereLength]
      while (this.whereList[clauseName]) {
        clauseName += '_'
      }
    }
    let originalCondition = condition
    const WhereCondition = CustomRepository.prototype.WhereCondition
    condition = WhereCondition[condition]
    if (expression && condition !== 'custom' && !bracketsRe.test(expression)) {
      expression = '[' + expression + ']'
    }
    if (!condition) {
      throw new Error('Unknown conditions')
    }
    if (((condition === 'in') || (condition === 'notIn')) && (values instanceof CustomRepository)) { // subquery
      subQueryType = condition // remember sub-query type
      condition = 'subquery'
      values = values.ubql() // get a subquery definition from a sub-repository
    } else if (condition === 'subquery') {
      subQueryType = originalCondition
      if (values instanceof CustomRepository) {
        values = values.ubql() // get a subquery definition from a sub-repository
      }
    } else if ((condition === 'in' || condition === 'notIn') && (values === null || values === undefined)) {
      // prevent ORA-00932 error - in case value is undefined instead of array
      console.warn('Condition "in" is passed to CustomRepository.where but values is null or undefined -> condition transformed to (0=1). Check your logic')
      expression = '0'
      condition = WhereCondition.equal
      values = {a: 1}
    } else if (condition === 'in' && (!Array.isArray(values))) {
      console.debug('Condition "in" is passed to CustomRepository.where but values is not an array -> condition transformed to equal. Check your logic')
      condition = WhereCondition.equal
    } else if (condition === 'in' && (!values || !values.length)) {
      console.warn('Condition "in" is passed to CustomRepository.where but value is empty array -> condition transformed to "0=1". Check your logic')
      expression = '0'
      condition = WhereCondition.equal
      values = {a: 1}
    } else if (condition === 'notIn' && (!values || !values.length)) {
      console.warn('Condition "notIn" is passed to CustomRepository.where but value is empty array -> condition transformed to "1=1". Check your logic')
      expression = '1'
      condition = WhereCondition.equal
      values = {a: 1}
    } else if (values === null && (condition !== 'isNull' || condition !== 'notIsNull')) {
      let wrongCondition = condition
      values = undefined
      condition = conditionInCaseValueIsNull[wrongCondition]
      if (condition) {
        console.warn('Condition ' + wrongCondition + 'is passed to CustomRepository.where but value is null -> condition transformed to ' + condition + '. Check your logic')
      } else {
        throw new Error('Condition ' + wrongCondition + 'is passed to CustomRepository.where but value is null')
      }
    }
    if (condition === 'in' && (values.length === 1)) {
      // console.warn('Condition "in" is passed to CustomRepository.where but value is an array on ONE item -> condition transformed to "equal". Check your logic')
      condition = WhereCondition.equal
      values = values[0]
    }
    if (values !== undefined && (typeof (values) !== 'object' || Array.isArray(values) || _.isDate(values))) {
      let obj = {}
      obj[clauseName] = values
      values = obj
    }
    let whereItem = {
      expression: expression,
      condition: condition
    }
    if (condition === 'subquery') {
      whereItem.subQueryType = subQueryType
    }
    if (values !== undefined) {
      whereItem.values = values
    }
    this.whereList[clauseName] = whereItem
    return this
  }

  /**
   *  Adds where condition with `EXISTS` sub-query. Inside a sub-query there are two macros:
   *
   *  - `{master}` will be replaced by master entity alias
   *  - `{self}` will be replaced by sub-query entity alias
   *
   * @example

  UB.Repository('uba_user').attrs(['ID', 'name']) //select users
    // who are not disabled
    .where('disabled', '=', 0)
    // which allowed access from Kiev
    .where('trustedIP', 'in',
     UB.Repository('geo_ip').attrs('IPAddr')
       .where('city', '=', 'Kiev')
    )
    // who do not login during this year
    .notExists(
     UB.Repository('uba_audit')
       .correlation('actionUser', 'name')  // here we link to uba_user.name
       .where('actionTime', '>', new Date(2016, 1, 1))
       .where('actionType', '=', 'LOGIN')
    )
    // but modify some data
    .exists(
     UB.Repository('uba_auditTrail')
       .correlation('actionUser', 'ID') // here we link to uba_user.ID
       .where('actionTime', '>', new Date(2016, 1, 1))
    )
    .select()

   * @param {CustomRepository} subRepository  Repository, what represent a sub-query to be execute inside EXISTS statement
   * @param {string} [clauseName] Optional clause name
   * @return {CustomRepository}
   */
  exists (subRepository, clauseName) {
    return this.where('', 'exists', subRepository, clauseName)
  }

  /**
   * Adds where condition with `NOT EXISTS` sub-query. See CustomRepository.exists for sample
   *
   * @param {CustomRepository} subRepository  Repository, what represent a sub-query to be execute inside EXISTS statement
   * @param {string} [clauseName] Optional clause name
   * @return {CustomRepository}
   */
  notExists (subRepository, clauseName) {
    return this.where('', 'notExists', subRepository, clauseName)
  }

  /**
   * If current repository is used as a sub-query for `exists`, `notExists`, `in` or `notIn` conditions
   * [correlation](https://en.wikipedia.org/wiki/Correlated_subquery) with a master repository will added
   *
   * @param {string} subQueryAttribute
   * @param {string} masterAttribute
   * @param {WhereCondition|String} [condition=eq] A subset from WhereCondition list applicable for correlation join
   * @param {string} [clauseName] Optional clause name to be used in {@link CustomRepository#logic logic}.
   *   If not passed unique clause names ('c1', 'c2', ...) where will be generated
   * @return {CustomRepository}
   */
  correlation (subQueryAttribute, masterAttribute, condition, clauseName) {
    if (!bracketsRe.test(subQueryAttribute)) {
      subQueryAttribute = '[' + subQueryAttribute + ']'
    }
    if (!condition) condition = '='
    return this.where(subQueryAttribute + condition + '[{master}.' + masterAttribute + ']', 'custom', undefined, clauseName)
  }
  /**
   * Arrange `where expressions` in logical order. By default `where expressions` are joined by AND logical predicate.
   * It is possible to join it in custom order using `logic`.
   *
   * @example

  UB.Repository('my_entity').attrs('id')
   // code in ('1', '2', '3')
   .where('code', 'in', ['1', '2', '3'], 'byCode')
   // name like '%homer%'
   .where('name', 'contains', 'Homer', 'byName')
   //(birtday >= '2012-01-01') AND (birtday <= '2012-01-02')
   .where('birtday', 'geq', new Date()).where('birtday', 'leq', new Date() + 10)
   // (age + 10 >= 15)
   .where('[age] -10', '>=', {age: 15}, 'byAge')
   // (byCode OR byName) AND (all where items, not included in logic)
   .logic('(([byCode]) OR ([byName]))')

   * @param {string} predicate logical predicate.
   * @return {CustomRepository}
   */
  logic (predicate) {
    this.logicalPredicates.push(predicate)
    return this
  }

  /**
   * Force `where expressions` to be used in join part of SQL statement instead of where part. Applicable only for not cached entities
   * @exapmle

  // will generate
  // SELECT A.ID, B.code FROM tst_document A LEFT JOIN tst_category B
  //    ON (B.instanceID = A.ID and B.ubUser = 10)
  // instead of
  // SELECT A.ID, B.code FROM tst_document A LEFT JOIN tst_category B
  //    ON B.instanceID = A.ID
  //    WHERE B.ubUser = 10
  UB.Repository('tst_document').attrs(['ID', '[caregory.code]'])
   .where('[caregory.ubUser]', '=', 10, 'wantInJoin')
   .join('wantInJoin')
   .selectAsObject().done(UB.logDebug)

   * @param {string} whereItemName name of where item to use in join.
   * @return {CustomRepository}
   */
  join (whereItemName) {
    this.joinAs.push(whereItemName)
    return this
  }

  /**
   * Adds join condition. Fix some known issues
   *
   * @param {string} expression   Attribute name (with or without []) or valid expression with attributes in [].
   * @param {CustomRepository.WhereCondition} condition    Any value from WhereCondition list.
   * @param {*} [values] Condition value. In case expression is complex can take {Object} as value.
   *   In case values === undefined no values property passed to where list
   * @param {string} [clauseName] Optional clause name to be used in {CustomRepository.logicalPredicates}.
   *   If not passed where will generate unique clause named 'c1', 'c2', ......
   * @return {CustomRepository}
   */
  joinCondition (expression, condition, values, clauseName) {
    if (!clauseName) { // generate unique clause name
      clauseName = cNames[++this._whereLength]
      while (this.whereList[clauseName]) {
        clauseName += '_'
      }
    }
    this.where(expression, condition, values, clauseName)
    this.joinAs.push(clauseName)
    return this
  }

  /**
   * Sorting
   * @example

  UB.CustomRepository('my_entity').attrs('ID').orderBy('code')

   * @param {string} attr Sorted attribute
   * @param {string} [direction='asc'] Sort direction ('asc'|'desc')
   * @return {CustomRepository}
   */
  orderBy (attr, direction) {
    direction = direction || 'asc'
    this.orderList.push({
      expression: attr,
      order: direction
    })
    return this
  }

  /**
   * Adds descend sorting. The same as orderBy(attr, 'desc')
   * @example

  UB.Repository('my_entity').attrs('ID')
    // ORDER BY code, date_create DESC
    .orderBy('code').orderByDesc('date_create')

   * @param {string} attr
   * @return {CustomRepository}
   */
  orderByDesc (attr) {
    this.orderList.push({
      expression: attr,
      order: 'desc'
    })
    return this
  }

  /**
   * Adds grouping
   * @example

  UB.Repository('my_entity').attrs('ID')
   .groupBy('code')
  UB.Repository('uba_user').attrs('disabled')
   .groupBy('disabled').select()
  UB.Repository('uba_user').attrs(['disabled','uPassword','COUNT([ID])'])
   .groupBy(['disabled','uPassword']).select()

   * @param {string|Array<string>} attr Grouped attribute(s)
   * @return {CustomRepository}
   */
  groupBy (attr) {
    if (Array.isArray(attr)) {
      this.groupList = this.groupList.concat(attr)
    } else if (_.isString(attr)) {
      this.groupList.push(attr)
    }
    return this
  }

  /**
   * Retrieve first `start` rows
   * @example

  let store = UB.Repository('my_entity').attrs('id')
   //will return ID's from 15 to 25
   .start(15).limit(10).select()

   * @param {Number} start
   * @return {CustomRepository}
   */
  start (start) {
    this.options.start = start
    return this
  }

   /**
   * How many rows to select
   * @example

  // will return first two ID's from my_entity
  let store = UB.Repository('my_entity').attrs('id').limit(2).selectAsObject()

   * @param {number} rowsLimit
   * @return {CustomRepository}
   */
  limit (rowsLimit) {
    this.options.limit = rowsLimit
    return this
  }

  /**
   * Construct a UBQL JSON
   * @example

  let repo = UB.Repository('my_entity').attrs('ID').where('code', '=', 'a')
  let inst = UB.DataStore(my_entity)
  inst.run('select', repo.ubql())

   * @return {Object}
   */
  ubql () {
    let orderCnt = this.orderList.length
    let req = {
      entity: this.entityName,
      method: this.method,
      fieldList: this.fieldList
    }
    if (this.groupList.length > 0) {
      req.groupList = this.groupList
    }
    if (Object.keys(this.whereList).length) {
      req.whereList = this.whereList
    }
    if (orderCnt > 0) {
      req.orderList = {}
      for (let i = 0; i < orderCnt; i++) {
        req.orderList[i] = this.orderList[i]
      }
    }
    if (Object.keys(this.options).length) { // .limit || .start .totalRequired
      req.options = this.options
    }
    if (this.logicalPredicates.length) {
      req.logicalPredicates = this.logicalPredicates
    }
    if (this.joinAs.length) {
      req.joinAs = this.joinAs
    }
    _.defaults(req, this.__misc) // apply misc

    return req
  }

  /**
   * Must be implemented in descendants and return (or resolved for async clients)
   * to `array of object` representation of result, like this
   *
   *      [{"ID":3000000000004,"code":"uba_user"},{"ID":3000000000039,"code":"uba_auditTrail"}]
   *
   * @abstract
   * @return {*}
   */
  selectAsObject () {
    throw new Error('abstract')
  }
  /**
   * Must be implemented in descendants and return (or resolved for async clients)
   * to `array of array` representation of result, like this
   *
   *      {"resultData":{"fields":["ID","name","ID.name"],"rowCount":1,"data":[[10,"admin","admin"]]},"total":1,"__totalRecCount": totolRecCountIfWithTotalRequest}
   *
   * @abstract
   */
  selectAsArray () {
    throw new Error('abstract')
  }

  /**
   * Must be implemented in descendants and return (or resolved for async clients)
   * to `DataSet` class instance, implemented in caller level. It can be:
   *
   *  - {TubDataStore} for in-server context
   *  - {UB.ux.data.UBStore} for UnityBase `adminUI` client
   *  - `array of array` data representation for UnityBase remote connection
   *  - etc.
   *
   * @abstract
   * @param [storeConfig]
   */
  selectAsStore (storeConfig) {
    throw new Error('abstract')
  }

  /**
   * Must be implemented in descendants as a alias to the most appropriate method
   *
   * @abstract
   * @param [storeConfig]
   */
  select (storeConfig) {
    throw new Error('abstract')
  }

  /**
   * Select a single row. If ubql result is empty - return `undefined`
   * @example

  UB.Repository('uba_user').attrs('name', 'ID').where('ID', '=', 10)
   .selectSingle().then(UB.logDebug)
  // will output: {name: "admin", ID: 10}

   * **WARNING** method does not check if result contains the single row and always returns a first row from result
   * @abstract
   * @return {*|undefined}
   */
  selectSingle () {
    throw new Error('abstract')
  }

  /**
   * Execute select and returns a value of the first attribute from the first row
   * @example

  UB.Repository('uba_user')
    .attrs('name')
    .where('ID', '=', 10)
    .selectScalar().then(UB.logDebug) // will output `admin`

   * **WARNING** does not check if result contains the single row
   * @abstract
   * @return {Number|String|undefined}
   */
  selectScalar () {
    throw new Error('abstract')
  }

  /**
   * Select a single row by ID. If result is empty - returns `undefined`
   * If result is not empty - returns a object
   * @example

  UB.Repository('uba_user').attrs('name', 'ID').selectById(10).then(UB.logDebug)
  // will output: {name: "admin", ID: 10}

   * @abstract
   * @param {Number} ID Row identifier
   * @return {Object|undefined}
   */
  selectById (ID) {
    throw new Error('abstract')
  }

  /**
   * Apply miscellaneous options to resulting UBQL
   * @example

  // this server-side call will select all currency, including deleted
  UB.Repository('cdn_currency').attrs(['ID'])
    .misc({__allowSelectSafeDeleted: true}).selectAsArray();

   * @param {Object} flags
   * @param {Date} [flags.__mip_ondate] Specify date on which to select data for entities with `dataHistory` mixin. Default to Now()
   * @param {Boolean} [flags.__mip_recordhistory=false] Select only record history data for specified ID (for entities with `dataHistory` mixin)
   * @param {Boolean} [flags.__mip_recordhistory_all=false] Ignore __mip_ondate and select all data (acts as select for entities without `dataHistory` mixin)
   * @param {Boolean} [flags.__mip_disablecache=false] For entities with cacheType in ["Session", "SessionEntity"] not check is data modified and always return result
   * @param {Boolean} [flags.__skipOptimisticLock=false] Skip optimistic lock for entities with `mStorage.simpleAudit = true`
   * @param {Boolean} [flags.__allowSelectSafeDeleted=false] **Server-side only.**
   * @param {Boolean} [flags.__skipSelectAfterUpdate=false] **Server-side only.**
   * @param {Boolean} [flags.__skipSelectAfterInsert=false] **Server-side only.**
   * @param {Boolean} [flags.__skipRls=false] **Server-side only.**
   * @param {Boolean} [flags.__skipAclRls=false] **Server-side only.**
   * @return {CustomRepository}
   */
  misc (flags) {
    _.assign(this.__misc, flags)
    return this
  }

  /**
   * Calculate total row number. WARNING!! This is VERY slow operation on DB level in case of many record
   *
   * Result of calculation is returned in __totalRecCount parameter value in case `selectAsArray()` client call:
   *
        let result = UB.Repository('uba_user').attrs(['ID', 'description'])
           .withTotal().selectAsArray();
        console.log('Total count is:', result.__totalRecCount)
   *
   * Or into TubDataStore.totalRowCount in case of server side `selectAsStore()` call:
   *
         let store = UB.Repository('uba_user').attrs(['ID', 'description'])
           .withTotal().selectAsStore();
         console.log('Total count is:', store.totalRowCount);
   *
   * @return {CustomRepository}
   */
  withTotal () {
    this.options.totalRequired = true
    return this
  }
}

/**
 * Alias to {@link CustomRepository#ubql CustomRepository.ubql}
 * @memberOf CustomRepository
 * @private
 * @deprecated Will be removed in UB 5.1. Use .ubql() instead
 */
CustomRepository.prototype.getRunListItem = CustomRepository.prototype.ubql
/**
 * Alias to {@link CustomRepository#ubql CustomRepository.ubql}
 * @method
 * @memberOf CustomRepository
 * @private
 * @deprecated Will be removed in UB 5.1. Use .ubql() instead
 */
CustomRepository.prototype.ubRequest = CustomRepository.prototype.ubql

/**
 * Enumeration of all condition types. This enumeration defines a set of String values.
 * It exists primarily for documentation purposes - in code use the actual string values like '>', don't reference them through this class like WhereCondition.more.
 *
 * We define several aliases for the same condition. In case of direct HTTP request (without Repository) use only non-aliased values (i.e. `more` instead of '>' or 'gt')
 * @memberOf CustomRepository
 * @enum {string}
 */
CustomRepository.prototype.WhereCondition = {
  /** @description Alias for `more` */
  'gt': 'more',
  /** @description Alias for `more` */
  '>': 'more',
  /** @description Greater than */
  'more': 'more',
  /** @description Alias for `less` */
  'lt': 'less',
  /** @description Alias for `less` */
  '<': 'less',
  /** @description Less than */
  'less': 'less',

  /** @description Alias for `equal` */
  'eq': 'equal',
  /** @description Alias for `equal` */
  '=': 'equal',
  /** @description Equal to */
  'equal': 'equal',

  /** @description Alias for `moreEqual` */
  'ge': 'moreEqual',
  /** @description  Alias for `moreEqual` */
  'geq': 'moreEqual',
  /** @description  Alias for `moreEqual` */
  '>=': 'moreEqual',
  /** @description  Greater than or equal */
  'moreEqual': 'moreEqual',

  /** @description Alias for `lessEqual` */
  'le': 'lessEqual',
  /** @description Alias for `lessEqual` */
  'leq': 'lessEqual',
  /** @description Alias for `lessEqual` */
  '<=': 'lessEqual',
  /** @description Less than or equal */
  'lessEqual': 'lessEqual',

  /** @description Alias for `notEqual` */
  'ne': 'notEqual',
  /** @description Alias for `notEqual` */
  'neq': 'notEqual',
  /** @description Alias for `notEqual` */
  '<>': 'notEqual',
  /** @description Alias for `notEqual` */
  '!=': 'notEqual',
  /** @description Alias for `notEqual` */
  '!==': 'notEqual',
  /** @description Not equal */
  'notEqual': 'notEqual',

  /** @description Alias for `like` */
  'contains': 'like',
  /** @description Like condition. For attributes of type `String` only */
  'like': 'like',

  /** @description Alias for `notLike` */
  'notContains': 'notLike',
  /** @description Not like condition. For attributes of type `String` only */
  'notLike': 'notLike',

  /** @description Is null */
  'isNull': 'isNull',
  /** @description Alias for `isNull` */
  'null': 'isNull',

  /** @description Alias for `notIsNull` */
  'notNull': 'notIsNull',
  /** @description Not is null */
  'notIsNull': 'notIsNull',
  /** @description Alias for `notIsNull` */
  'isNotNull': 'notIsNull',

  /** @description Alias for `startWith` */
  'beginWith': 'startWith',
  /** @description Start with. For attributes of type `String` only */
  'startWith': 'startWith',
  /** @description Alias for `startWith` */
  'startsWith': 'startWith',
  /** @description Alias for `startWith` */
  'startswith': 'startWith',

  /** @description Alias for `notStartWith` */
  'notBeginWith': 'notStartWith',
  /** @description Not start with. For attributes of type `String` only */
  'notStartWith': 'notStartWith',
  /** @description Alias for `notStartWith` */
  'notStartsWith': 'notStartWith',

  /** @description Alias for `in` */
  'includes': 'in',
  /** @description One of. Can accept array of string on array of Int/Int64 as values depending on attribute type. */
  'in': 'in',

  /** @description Alias for `notIn` */
  'notIncludes': 'notIn',
  /** @description Not one of. See WhereCondition.in for details */
  'notIn': 'notIn',

  /** @description For entities with FTS mixin enabled. TODO - expand */
  'match': 'match',

  /** @description Execute a sub-query passed in values. Better to use 'in' condition with Repository as a values parameter or a CustomRepository.exists method */
  'subquery': 'subquery',
  /** @description Execute a exists(sub-query) passed in values. Better to use CustomRepository.exists method */
  'exists': 'subquery',
  /** @description Execute a not exists(sub-query) passed in values. Better to use CustomRepository.notExists method */
  'notExists': 'subquery',

  /** @description Custom condition. For Server-side call only. For this condition `expression` can be any SQL statement */
  'custom': 'custom'
}

/**
 * Abstract Custom repository (extended by serverRepository & ClientRepository)
 * @type {CustomRepository}
 */
module.exports = CustomRepository
