/*
 * Repository for server-side data retrieve
 *
 * @author pavel.mash
 */

const csShared = require('@unitybase/cs-shared')
const CustomRepository = csShared.CustomRepository
const LocalDataStore = csShared.LocalDataStore

/* global TubDataStore */
/**
 * @classdesc
 * Server side repository.
 * Overrided {@link ServerRepository#select} method return initialized {@link TubDataStore}
 *
 * Usually is created by using one of the fabric functions:
 *
 *   - {@link UB.Repository UB.Repository} for entities from this server instance
 *   - {@link SyncConnection#Repository conn.Repository} for access remote UB server
 *

     let store = UB.Repository('my_entity')
       .attrs('id')
       .where('code', 'in', ['1', '2', '3'])  // code in ('1', '2', '3')
       .where('name', 'contains', 'Homer') // name like '%homer%'
       .where('birtday', 'geq', new Date()) //(birtday >= '2012-01-01')
       .where('birtday', 'leq', new Date() + 10) // AND (birtday <= '2012-01-02')
       .where('[age] -10', '>=', {age: 15}, 'byAge') // (age + 10 >= 15)
       .where('', 'match', 'myvalue') // perform full text search for entity (require fts mixin)
       .logic('(byStrfType OR bySrfKindID)AND(dasdsa)')
       .select()

 * @extends CustomRepository
 */
class ServerRepository extends CustomRepository {
  /**
   * @private
   * @param {SyncConnection|null} connection The remote server connection or `null` for internal server thread
   * @param {String} entityName name of Entity we create for
   */
  constructor (connection, entityName) {
    super(entityName)
    /**
     * @type {SyncConnection}
     * @private
     */
    this.connection = connection
  }

  /**
   * @param {Object<string, string>} [fieldAliases] Optional object to change attribute
   *  names during transform array to object
   * @param {Boolean} [resultInPlainText=false] If true - result is {String}
   * @return {Array.<Object>|String}
   */
  selectAsObject (fieldAliases, resultInPlainText) {
    if (process.isServer) { // inside server thread
      // check UB < 5.2 selectAsObject signature
      if ((typeof fieldAliases === 'boolean') || (fieldAliases && resultInPlainText)) {
        throw new Error('first parameter of ServerRepository should not be boolean. fieldAliases can not be combined with plain text result')
      }
      let inst = new TubDataStore(this.entityName)
      inst.run('select', this.ubql())
      let res
      if (fieldAliases) {
        res = {resultData: JSON.parse(inst.asJSONArray)}
        res = LocalDataStore.selectResultToArrayOfObjects(res, fieldAliases)
      } else {
        res = resultInPlainText ? inst.asJSONObject : JSON.parse(inst.asJSONObject)
      }
      inst.freeNative() // release memory ASAP
      return res
    } else {
      let conn = this.connection
      if (resultInPlainText) throw new Error('plainTextResult parameter not applicable in this context')
      return LocalDataStore.selectResultToArrayOfObjects(conn.query(this.ubql()), fieldAliases)
    }
  }

  /**
   * @param {Boolean} [resultInPlainText=false] If true - result is {String}
   * @return {TubCachedData|String} // todo this is TubCachedData structure!!!
   */
  selectAsArray (resultInPlainText) {
    if (process.isServer) { // inside server thread
      let inst = new TubDataStore(this.entityName)
      inst.run('select', this.ubql())
      let res = resultInPlainText ? inst.asJSONArray : { resultData: JSON.parse(inst.asJSONArray) }
      if ((!resultInPlainText) && (this.options && this.options.totalRequired)) {
        inst.currentDataName = '__totalRecCount'
        res.__totalRecCount = inst.get(0)
      }
      inst.freeNative() // release memory ASAP
      return res
    } else {
      if (resultInPlainText) {
        throw new Error('plainTextResult parameter not applicable in this context')
      }
      return this.connection.query(this.ubql())
    }
  }

  /**
   * Create new, or use passed as parameter {@link TubDataStore} and run {@link class:TubDataStore#select TubDataStore.select} method passing result of {@link class:CustomRepository#ubql CustomRepository.ubql()} as config.
   * Do not work for remote connection.
   *
   * @param {TubDataStore} [instance] Optional instance for in-thread execution context. If passed - run select for it (not create new instance) and return instance as a result.
   *   Be careful - method do not check instance is created for entity you pass to Repository constructor.
   * @return {TubDataStore|Array.<Object>}
   */
  selectAsStore (instance) {
    let inst
    if (this.connection) {
      if (instance) { throw new Error('parameter instance applicable only for in-server execution context') }
      inst = this.selectAsObject()
    } else {
      inst = instance || new TubDataStore(this.entityName)
      inst.run('select', this.ubql())
    }
    return inst
  }

  /**
   * @param {TubDataStore} [instance] Optional instance for in-thread execution context. If passed - run select for it (not create new instance) and return instance as a result.
   * @return {TubDataStore}
   */
  select (instance) {
    return this.selectAsStore(instance)
  }

  /**
   * Select a single row. If ubql result is empty - return {undefined}.
   *
   * WARNING method do not check repository conntains the single row and always return a first row from result.
   * @param {Object<string, string>} [fieldAliases] Optional object to change attribute
   *  names during transform array to object
   * @return {Object|undefined}
   */
  selectSingle (fieldAliases) {
    return this.selectAsObject(fieldAliases)[ 0 ]
  }

  /**
   * Perform select and return a value of the first attribute from the first row
   *
   * WARNING method do not check repository contains the single row
   * @return {Object|undefined}
   */
  selectScalar () {
    let result = this.selectAsArray()
    return Array.isArray(result.resultData.data[ 0 ]) ? result.resultData.data[ 0 ][ 0 ] : undefined
  }

  /**
   * Select a single row by ID. If ubql result is empty - return {undefined}.
   *
   * @param {Number} ID Row identifier
   * @return {Object|undefined}
   */
  selectById (ID) {
    return this.where('[ID]', '=', ID).selectSingle()
  }
}
/**
 * Create new instance of ServerRepository
 *
 *      const Repository = require('@unitybase.base').ServerRepository.fabric;
 *      var req = Repository('uba_user').attrs('*').ubql();
 *
 * @param {String} entityName name of Entity for which we create repository
 * @param {SyncConnection} [connection] The remote server connection. For internal server thread can be empty
 * @return {ServerRepository}
 * @private
 */
function fabric (entityName, connection = null) {
  return new ServerRepository(connection, entityName)
}

module.exports = {
  ServerRepository,
  fabric
}
