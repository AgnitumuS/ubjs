/* global TubDataStore */
const App = require('./modules/App')
const blobStores = require('./blobStores')

/**
 * @classdesc
 * Entity communication class. Use it to:
 *
 *  - execute any entity method using {@link TubDataStore#run}
 *  - execute any SQL statement using {@link TubDataStore#runSQL} or {@link TubDataStore.execSQL} (we strongly recommend usage of ORM instead SQL)
 *  - store several named data collection using {@link TubDataStore#currentDataName} (data stored inside server memory, not in JS, this is very good for GC)
 *  - iterate other collection rows using {@link TubDataStore#next}, eof, e.t.c and retrieve row data using TubDataStore.get
 *  - serialize data to XML or JSON
 *
 *  To retrieve data from database using build-in ORM (to execute entity `select` method) preffered way is to use {@link UB.Repository} fabric function.
 *
 * @class TubDataStore
 * @param {String} entityCode
 * @constructor
 */
/**
 * Run any entity method.
 * @example
 *
 * var store = new TubDataStore('doc_attachment');
 * store.run('update', {execParams: {
 *          ID: 1,
 *          approved: 0
 *      }
 * });
 *
 * store.run('anyEntityMethod', {param1: 'valueOfParam1', ...});
 *
 * @param {String} methodName
 * @param {Object|TubList} params
 * @return {Boolean} True in case of success, else raise exception
 * @method run
 */
/**
 * Execute SQL with parameters and place result into dataStore. This method expect SQL statement have **result**.
 *
 * To execute SQL statement without result (`insert` for example) - use TubDataStore.execSQL instead.
 *
 * @param {String} sql SQL statement to run
 * @param {Object|TubList} params SQL parameters list
 * @method runSQL
 */
/**
 * Execute SQL with parameters. Not wait result data
 * @param {String} sql SQL statement to run
 * @param {Object|TubList} params SQL parameters list
 * @method execSQL
 */
/**
 * init dataStore content from JSON string
 * If you need to init dataStore w/o rows:
 *
 *      var ds = new TubDataStore('myEntityCode');
 *      ds.initFromJSON({"fieldCount":1,"values":["ID"],"rowCount":0});
 *      console.log(ds.initialized); // TRUE
 *
 * WARNING!!! during initFromJSON UnityBase determinate field types from vield values,
 *  so if some data column contain only numeric values it becode Number (even if in source it String).
 *
 * @param source
 * @method initFromJSON
 */

/**
 * Return zero based index of fieldName from current data store (-1 if not found)
 * @example

 var r = UB.Repository('cdn_organization').attrs(['ID', 'mi_owner.name']).where('[ID]', '=', 3000000002801).select();
 console.log(r.fieldIndexByName('mi_owner.name')); // 1
 console.log(r.fieldIndexByName('unexistedAttr')); // -1

 * @param {String} fieldName
 * @method fieldIndexByName
 */

/**
 * Return value of attribute.
 *
 * In case store initialized using TubDataStore.run style we can return Number or String type,
 * but in case it initialized using runSQL columns data types is unknown and you must cast value do required type directly.
 *
 * @param {Number|String} attrib attribute index or name. Index is faster but less readable.
 * @return {Number|String}
 * @method get
 */

/**
 * Return value of attribute as ArrayBuffer.
 *
 * You can apply this method to blob fields only
 *
 * @param {Number|String} attrib attribute index or name. Index is faster but less readable.
 * @return {ArrayBuffer}
 * @method getAsBuffer
 */
/**
 * Move next
 * @method next
 */
/**
 * Move prev
 * @method prev
 */
/**
 * Move first
 * @method first
 */
/**
 * Move last
 * @method last
 */
/**
 * Indicate current position in data collection is on the begining of collection
 * @property {Boolean} bof
 */
/**
 * Indicate current position in data collection is on the end of collection.
 * @property {Boolean} eof
 */
/**
 * Generate a new identifier (int64)
 * @return {Number}
 * @method generateID
 */
/**
 * Is store initialized
 * @property {Boolean} initialized
 */
/**
 * Return string representation of Instance in format `[{attr1: value1, attr2: value2},... ]`
 * @property {String} asJSONObject
 */
/**
 * Return string representation of Instance in `Array of array` format
 * @property {String} asJSONArray
 */
/**
 * Return XML representation of Instance in MS DataSet format
 * @property {String} asXMLPersistent
 */
/**
 * Active dataset name we work with. There is some predefined dataNames - see TubDataStore.prototype.DATA_NAMES
 * @property {String} currentDataName
 */
/**
 * Record count. If DataStore is not initialized or empty will return 0.
 * @property {Number} rowCount
 */
/**
 * Total record count if store are filled with withTotal() option.
 * If DataStore is not initialized or empty or inited without withTotal() will return -1.
 * @property {Number} totalRowCount
 */
/**
 * Row position inside currentDataName dataset. Read/write
 * @property {Number} rowPos
 */
/**
 * Release all internal resources. Store became unusable after call to `freeNative()`
 * @method freeNative
 */
/**
 *  Initialize DataStore from one of supported source formats:
 *
 *   - Flatten(fastest): <pre>{fieldCount: K, rowCount: Z, values: [field1Name, ..., fieldKName, row1field1Value,  ..., row1fieldKValue, row2field1Value,..]}</pre>
 *   - Array-of-array  : <pre>[[row1field1Value,  ..., row1fieldKValue], ..., [rowZfield1Value, ... rowZfieldKValue]</pre>
 *   - Array-of-object : <pre>[{field1Name: row1field1Value, ..., fieldKName: row1fieldKValue}, ....]</pre>
 *
 *  Can (optionally) convert source field names to new names using keyMap array.
 *  @example
 *
     var ds = new TubDataStore('my_entity');

     // init empty (rowCount=0) dataStore with provided fields.
     // In case keyMap is omitted we consider it contain one attribute 'ID'
     ds.initialize([]); // the same as ds.initialize([], ['ID']);
     ds.initialize([], ['ID', 'name', {from: 'AGE', to: 'age'}]);

     // Initialize dataStore from array-of-object representation
     // Resulting datstore will contain 3 field: ID, nam, age (in order, they listen in keyMap array).
     // During initialization we convert fiend name 'AGE' -> age;
     ds.initialize([{ID: 10, name: 'Jon', AGE: 10}, {ID: 20, name: 'Smith', AGE: 63}],
        ['ID', 'name', {from: 'AGE', to: 'age'}]);

     //the same, but do not convert AGE->age. Result dataset field order is unknown
     ds.initialize([{ID: 10, name: 'Jon', AGE: 10}, {ID: 20, name: 'Smith', AGE: 63}]);

     //result dataset will contain only two field 'ID' & 'age'
     ds.initialize([{ID: 10, name: 'Jon', AGE: 10}, {ID: 20, name: 'Smith', AGE: 63}],
        ['ID', {from: 'AGE', to: 'age'}]);

     // Initialize dataStore from Array-of-array data
     // in this case keyMap is mandatory.
     // In case of mapping from is zero-based index of source element in row array
     ds.initialize([[10, 'Jon', 10], [20, 'Smith', 63]], ['ID', 'name', 'age']);
     // or use mapping
     ds.initialize([[10, 'Jon', 10], [20, 'Smith', 63]],
        ['ID', {from: 2, to: 'age'}, {from: 1, to: 'name'}]);

 * @param {Object|Array} source
 * @param {Array.<String|Object>} [keyMap] Optional mapping of source field names to new field names
 * @returns {TubDataStore}
 */
TubDataStore.initialize = function (source, keyMap) {
  let flatArray = []
  let resultFields = []
  let sourceFields = []

  function keyMap2Mapping (keyMap, isIndexBased) {
    for (let i = 0, l = keyMap.length; i < l; i++) {
      let elm = keyMap[i]
      if (typeof elm === 'object') {
        sourceFields.push(isIndexBased ? parseInt(elm.from, 10) : elm.from)
        resultFields.push(elm.to)
      } else {
        sourceFields.push(isIndexBased ? i : elm)
        resultFields.push(elm)
      }
    }
  }

  if (Array.isArray(source)) {
    let rowCount = source.length
    if (rowCount === 0) {
      // 1) empty store
      keyMap2Mapping((keyMap && keyMap.length) ? keyMap : ['ID'])
      this.initFromJSON({fieldCount: resultFields.length, rowCount: 0, values: resultFields}) // empty dataStore initialization
    } else if (Array.isArray(source[0])) {
      //  2) Array-of-array
      if ((!keyMap) || (!keyMap.length)) {
        throw new Error('TubDataStore.initialize: for array-of-array keyMap is required')
      }
      keyMap2Mapping(keyMap, true)
      let fieldCount = resultFields.length
      for (let i = 0; i < fieldCount; i++) { // field names
        flatArray.push(resultFields[i])
      }

      for (let i = 0; i < rowCount; i++) { // data
        let row = source[i]
        for (let j = 0; j < fieldCount; j++) {
          flatArray.push(row[sourceFields[j]]) // add source field using it index in keyMap
        }
      }
      this.initFromJSON({fieldCount: fieldCount, rowCount: rowCount, values: flatArray})
    } else if (typeof source[0] === 'object') {
      // 3) Array-of-object
      keyMap2Mapping((keyMap && keyMap.length) ? keyMap : Object.keys(source[0]))
      let fieldCount = resultFields.length
      for (let i = 0; i < fieldCount; i++) { // field names
        flatArray.push(resultFields[i])
      }
      for (let i = 0; i < rowCount; i++) { // data
        let row = source[i]
        for (let j = 0; j < fieldCount; j++) {
          flatArray.push(row[sourceFields[j]]) // add source field using it name from keyMap
        }
      }
      this.initFromJSON({fieldCount: fieldCount, rowCount: rowCount, values: flatArray})
    } else {
      throw new Error('TubDataStore.initialize: invalid source format for TubDataStore.initialize')
    }
  } else if ((typeof source === 'object') && (source.fieldCount > 0) && (source.rowCount > 0)) { // flatten
    if (keyMap) {
      if (keyMap.length !== source.fieldCount) {
        throw new Error('TubDataStore.initialize: for flatten data keyMap length must be equal to fieldCount')
      }
      for (let i = 0, l = source.fieldCount; i < l; i++) {
        if (typeof keyMap[i] !== 'string') {
          throw new Error('TubDataStore.initialize: for flatten data keyMap must contain only field names')
        }
        source.values[i] = keyMap[i]
      }
    }
    this.initFromJSON({fieldCount: source.fieldCount, rowCount: source.rowCount, values: source.values}) // order of properties is important for native reader realization
  } else {
    throw new Error('TubDataStore.initialize: invalid source format')
  }
  return this
}

/**
 * Extended information about application domain
 * @property {UBEntity} entity
 * @memberOf TubDataStore
 */
Object.defineProperty(TubDataStore, 'entity', {
  enumerable: true,
  get: function () {
    return App.domainInfo.get(this.entityCode)
  }
})

/**
 *  Active dataset name we work with
 *  @example
 *    let store = ctx.dataStore
 *    let prevData = store.currentDataName
 *    try {
 *      store.currentDataName = TubDataStore.DATA_NAMES.BEFORE_UPDATE
 *      let valueBeforeUpdate = store.get('code')
 *    } finally {
 *      store.currentDataName = prevData
 *    }
 */
TubDataStore.DATA_NAMES = {
  BEFORE_UPDATE: 'selectBeforeUpdate',
  AFTER_UPDATE: 'selectAfterUpdate',
  AFTER_INSERT: 'selectAfterInsert',
  BEFORE_DELETE: 'selectBeforeDelete',
  TOTAL: '__totalRecCount',
  SOFTLOCK: 'softLock',
  RECORDSIGN: 'recordSign',
  TEMP: '_temp'
}

// do additional operation with adtDocument attributes
//  move adtDocument content from temporary store to permanent
// return true if some document attribute actually changed
/**
 * If have attributes of type `Document` and it values changed then
 * for each changed attribute:
 *  - call a BLOB store implementation method `moveToPermanent`
 * @param {ubMethodParams} ctx
 * @param {Boolean} isUpdate
 * @return {Boolean} True in case some of document type attributes actually changed
 */
TubDataStore.commitBLOBStores = function (ctx, isUpdate) {
  let entity = this.entity
  if (!entity.blobAttributes.length) return false

  if (entity.isUnity) {
    console.debug('skip processing blobStores for UNITY update call', entity.name)
    return false
  }
  console.debug('Start processing documents for entity', entity.name)

  let execParams = ctx.mParams.execParams
  let modifiedBlobs = []
  for (let i = 0, L = entity.blobAttributes.length; i < L; i++) {
    let blobAttr = entity.blobAttributes[i]
    let newVal = execParams[blobAttr.name]
    if (newVal) {
      modifiedBlobs.push({
        attr: blobAttr,
        newVal: JSON.parse(newVal),
        oldVal: null
      })
    }
  }
  if (!modifiedBlobs.length) return false

  if (isUpdate) { // for update operations retrieve a prev. values
    let store = ctx.dataStore
    if (store && store.initialized) { // virtual entity can bypass store initialization
      let prevDataName = store.currentDataName
      try {
        store.currentDataName = this.DATA_NAMES.BEFORE_UPDATE
        if (!store.eof) {
          for (let i = 0, L = modifiedBlobs.length; i < L; i++) {
            let modifiedBlob = modifiedBlobs[i]
            if (!(modifiedBlob.newVal.isDirty || modifiedBlob.newVal.deleting)) { // [UB-858]
              throw new Error(`Invalid ${entity.name}.${modifiedBlob.attr.name} Document type attribute content. Update possible either for dirty or for deleting content`)
            }
            let oldVal = store.get(modifiedBlob.attr.name)
            if (oldVal) modifiedBlob.oldVal = JSON.parse(oldVal)
          }
        }
      } finally {
        store.currentDataName = prevDataName
      }
    }
  }

  // for each modified BLOB call a BLOB store implementation for actually
  // move BLOB data from temporary to permanent store
  let ID = execParams.ID
  for (let i = 0, L = modifiedBlobs.length; i < L; i++) {
    let modifiedBlob = modifiedBlobs[i]
    let newMeta = blobStores.doCommit(modifiedBlob.attr, ID, modifiedBlob.newVal, modifiedBlob.oldVal)
    execParams[modifiedBlob.attr.name] = newMeta ? JSON.stringify(newMeta) : null
  }
  return true
}

module.exports = TubDataStore
