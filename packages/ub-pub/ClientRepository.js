const csShared = require('@unitybase/cs-shared')
const LocalDataStore = csShared.LocalDataStore
const CustomRepository = csShared.CustomRepository

/**
 * @module ClientRepository
 * @memberOf module:@unitybase/ub-pub
 * @author pavel.mash 23.09.2014
 */

/**
 * @classdesc
 * Repository for client-side data retrieve.
 * Implement:
 *
 *  - {@link class:ClientRepository#select select} method for retrieve `array of object` representation of server entity
 *  - {@link class:ClientRepository#selectAsArray selectAsArray} method for retrieve `array of array` representation of server entity
 *  - {@link class:ClientRepository#selectAsStore selectAsStore} method for retrieve {UB.ux.data.UBStore} (applicable only for Ext-based client types)
 *
 * Usually created using <a href='../server-v5/ServerRepository.html'>UB.Repository</a> fabric function. Example:
 *
 *      var store = UB.Repository('my_entity').attrs(['ID', 'code'])
 *       .where('code', 'includes', ['1', '2', '3'])  // code in ('1', '2', '3')
 *       .where('name', 'contains', 'Homer'). // name like '%homer%'
 *        //(birthday >= '2012-01-01') AND (birthday <= '2012-01-02')
 *       .where('birthday', 'geq', new Date()).where('birthday', 'leq', new Date() + 10)
 *       .where('[age] -10', '>=', {age: 15}, 'byAge') // (age + 10 >= 15)
 *       .where('', 'match', 'myvalue') // for condition match expression not need
 *       .logic('(byStrfType OR bySrfKindID)AND(dasdsa)')
 *       .select().then(function(response){
 *          // here response is in [{ID: 10, code: 'value1'}, .... {}] format
 *       })
 *
 *
 * @class ClientRepository
 * @extends CustomRepository
 * @param {UBConnection} connection
 * @param {String} entityName name of Entity we create for
 */
class ClientRepository extends CustomRepository {
  constructor (connection, entityName) {
    super(entityName)
    /**
     * @property {UBConnection} connection
     * @private
     */
    Object.defineProperty(this, 'connection', { enumerable: false, writable: false, value: connection })
    /**
     * Raw result of method execution. Available after Promise of select* method execution is resolved.
     * Can be used to get additional response parameters such as `resultLock` or `resultAls`.
     * ** Client repository only **
     *
     * @example
     *
     *      // get lock information together with `select` execution
     *      let repo = UB.Repository('tst_document').attrs('ID').misc({lockType: 'None'}).where('ID', '=', 332729226657819)
     *      let data = await repo.selectSingle()
     *      let lockInfo = repo.rawResult.resultLock
     *
     * @type {Object|undefined}
     */
    this.rawResult = undefined
  }

  /**
   * For cached entities check all attributes from where/order is in fieldList and adds missed. Fix for [#107]
   * @private
   */
  addAttrsForCachedEntity () {
    if (!this.connection.domain) return
    /** @type {UBEntity} */
    const e = this.connection.domain.get(this.entityName, false)
    if (!e || !e.cacheType || (e.cacheType === 'None')) return
    const addAttrIfNotAdded = (expr) => {
      if (!expr) return
      let attr
      if (expr && (expr[0] === '[')) {
        attr = e.attributes[expr.slice(1, -1)] // remove []
      } else {
        attr = e.attributes[expr]
      }
      if (attr && !(this.fieldList.includes(attr.name) || this.fieldList.includes(expr))) {
        this.attrs(attr.name)
      }
    }
    for (const wn in this.whereList) {
      addAttrIfNotAdded(this.whereList[wn].expression)
    }
    for (const orderItem of this.orderList) {
      addAttrIfNotAdded(orderItem.expression)
    }
  }

  /**
   * Asynchronously run request, constructed by Repository. Return promise, resolved to `array of object`
   * representation of response.
   *
   *      UB.Repository('ubm_navshortcut').attrs(['ID', 'code'])
   *        .where('code', 'in', ['uba_user', 'uba_auditTrail'])
   *        .selectAsObj().then(function(store) {
   *          console.log(store)
   *          // output is [{"ID":3000000000004,"code":"uba_user"},{"ID":3000000000039,"code":"ubs_audit"}]
   *      });
   *
   *  Optionally can rename attributes in the resulting object:
   *
   *      UB.Repository('investment')
   *      .attrs(['ID', 'product', 'product.name', 'product.provider.name'])
   *      .selectAsObject({
              'product.name': 'productName',
              'product.provider.name': 'productProviderName'
          }).then(function(result){
              console.log(result);
              // output [{"ID": 1, "productName": "My product", "productProviderName": "My provider"}, ...]
          });
   *
   * @param {Object<string, string>} [fieldAliases] Optional object to change attribute
   *  names during transform array to object
   * @return {Promise}
   */
  selectAsObject (fieldAliases) {
    this.addAttrsForCachedEntity()
    return this.connection.select(this.ubql()).then(resp => {
      this.rawResult = resp
      return LocalDataStore.selectResultToArrayOfObjects(resp, fieldAliases)
    })
  }

  /**
   * Asynchronously run request, constructed by Repository. Return promise, resolved
   * to `array of array` representation of response.
   * Actual data is placed to `resultData` response property.
   *
   *      UB.Repository('ubm_navshortcut').attrs(['ID', 'code'])
   *      .where('code', 'in', ['uba_user', 'ubs_audit'])
   *      .select().then(UB.logDebug);
   *      // output is
   *      //{"resultData":{"data":[
   *      //  [3000000000004,"uba_user"],[3000000000039,"ubs_audit"]
   *      //],"fields":["ID","code"]},"total":2}
   *
   * Response MAY (but may not even for the same request) contain other variables,
   * returned by server in case data retrieved not from cache
   *
   *      // since uba_user have `unity` mixin it ID property point us to parent (`uba_subject` in this case)
   *      UB.Repository('uba_user').attrs(['ID', 'name', 'ID.name'])
   *      .selectAsArray().then(UB.logDebug);
   *      // {"entity":"uba_user","fieldList":["ID","name","ID.name"],"method":"select",
   *      // "resultData":{"fields":["ID","name","ID.name"],
   *      // "data":[[10,"admin","admin"]]},"total":1}
   *
   * But resultData is always present
   *
   * @return {Promise}
   */
  selectAsArray () {
    this.addAttrsForCachedEntity()
    return this.connection.select(this.ubql()).then(resp => {
      this.rawResult = resp
      return resp
    })
  }

  /**
   * For repository with ONE attribute returns a flat array of attribute values
   * @example

     const usersIDs = await UB.Repository('uba_user').attrs('ID').limit(100).selectAsArrayOfValues()
     // usersIDs is array of IDs [1, 2, 3, 4]

   * @return Array<string|number>
   */
  selectAsArrayOfValues () {
    this.addAttrsForCachedEntity()
    return this.connection.select(this.ubql()).then(resp => {
      return resp.resultData.data.map(r => r[0])
    })
  }

  /**
   * For core module (without Ext) - do the same as {ClientRepository.selectAsObj}
   *
   * For EntJS based client (actual implementation in {UB.ux.data.UBStore}) - create store based on request, constructed by Repository.
   * Return promise resolved to loaded {UB.ux.data.UBStore} instance.
   *
   *      UB.Repository('ubm_navshortcut').attrs(['ID', 'code'])
   *        .where('code', 'in', ['uba_user', 'ubs_audit'])
   *        .selectAsStore().then(function(store){
   *          console.log(store.getTotalCount()); // here store is UB.ux.data.UBStore instance
   *        });
   *
   * @param {Object} [storeConfig] optional config passed to store constructor
   * @return {Promise}
   */
  selectAsStore (storeConfig) {
    return this.selectAsObject(storeConfig)
  }

  /**
   * Alias to {@link class:ClientRepository#selectAsObject selectAsObject}
   */
  select (fieldAliases) {
    return this.selectAsObject(fieldAliases)
  }

  /**
   * Select a single row. If ubql result is empty - return {undefined}.
   *
   * WARNING method do not check repository contains the single row and always return
   * a first row from result.
   * @param {Object<string, string>} [fieldAliases] Optional object to change attribute names
   *   during transform array to object. See {@link class:ClientRepository#selectAsObject selectAsObject}
   * @return {Promise} Promise, resolved to {Object|undefined}
   */
  selectSingle (fieldAliases) {
    return this.selectAsObject(fieldAliases).then(function (row) {
      return row[0]
    })
  }

  /**
   * Perform select and return a value of the first attribute from the first row
   *
   * WARNING method do not check repository contains the single row
   * @return {Promise} Promise, resolved to {Object|undefined}
   */
  selectScalar () {
    return this.selectAsArray().then(function (result) {
      return (result.resultData.data.length) ? result.resultData.data[0][0] : undefined
    })
  }

  /**
   * Select a single row by ID. If ubql result is empty - return {undefined}.
   *
   * @param {Number} ID Row identifier
   * @param {Object<string, string>} [fieldAliases] Optional object to change attribute names
   *   during transform array to object. See {@link class:ClientRepository#selectAsObject selectAsObject}
   * @return {Promise} Promise, resolved to {Object|undefined}
   */
  selectById (ID, fieldAliases) {
    return this.where('[ID]', '=', ID).selectSingle(fieldAliases)
  }
}

module.exports = ClientRepository
