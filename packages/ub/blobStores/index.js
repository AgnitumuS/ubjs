const App = require('../modules/App')
const UBDomain = require('@unitybase/base').UBDomain
const Repository = require('@unitybase/base').ServerRepository.fabric
const queryString = require('querystring')
const {badRequest} = require('../modules/httpUtils')

// const TubDataStore = require('../TubDataStore')
const BLOB_HISTORY_STORE_NAME = 'ub_blobHistory'
let _blobHistoryDataStore
/** @private
 * @return {TubDataStore}
 */
function getBlobHistoryDataStore () {
  // eslint-disable-next-line
  if (!_blobHistoryDataStore) _blobHistoryDataStore = new TubDataStore(BLOB_HISTORY_STORE_NAME)
  return _blobHistoryDataStore
}

/**
 * @return {Object<string, BlobStoreCustom>}
 */
function createBlobStoreMap () {
  let blobStores = App.serverConfig.application.blobStores
  let res = {}
  if (!blobStores) return res
  blobStores.forEach((storeConfig) => {
    let storeImplementationModule = storeConfig['implementedBy']
    // UB4 compatibility
    if (!storeImplementationModule && (!storeConfig.storeType || storeConfig.name === 'fileVirtual')) {
      storeImplementationModule = '../blobStores/fileSystemBlobStore'
    }
    if (!storeImplementationModule && (storeConfig.name = 'mdb')) {
      storeImplementationModule = '../blobStores/mdbBlobStore'
    }
    if (storeImplementationModule === 'fileVirtualWritePDF') {
      storeImplementationModule = '../blobStores/fileVirtualWritePDF'
    }
    if (!storeImplementationModule) storeImplementationModule = '../blobStores/fileSystemBlobStore'

    if (storeConfig.isDefault) res.defaultStoreName = storeConfig.name
    let StoreClass = require(storeImplementationModule)
    res[storeConfig.name] = new StoreClass(storeConfig)
  })
  return res
}
const blobStoresMap = createBlobStoreMap()

/**
 * Blob store request (parameters passed to get|setDocument)
 * @typedef {Object} ParsedRequest
 * @property {Boolean} success
 * @property {String} [reason] Error message in case success === false
 * @property {BlobStoreRequest} [bsReq] Parsed parameters in case success
 * @property {UBEntityAttribute} [attribute] Entity attribute in case success
 */

/**
 * Check params contains entity,attribute & ID.
 * Entity should be in domain, attribute should be of `Document` type and ID should be Number
 * In case params are invalid return false (and write an error in resp)
 *
 * @param {*} params
 * @return {ParsedRequest}
 */
function parseBlobRequestParams (params) {
  let ID = parseInt(params.ID || params.id)
  if (ID <= 0) return {success: false, reason: 'incorrect ID value'}
  if (!params.entity || !params.attribute) {
    return {success: false, reason: 'One of required parameters (entity,attribute) not found'}
  }
  let entity = App.domainInfo.get(params.entity)
  let attribute = entity.getAttribute(params.attribute)
  if (attribute.dataType !== UBDomain.ubDataTypes.Document) {
    return {success: false, reason: `Invalid getDocument Request to non-document attribute ${params.entity}.${params.attribute}`}
  }
  let bsReq = {
    ID: ID,
    entity: params.entity,
    attribute: params.attribute,
    isDirty: (params.isDirty === true || params.isDirty === 'true' || params.isDirty === '1'),
    // UB <5 compatibility
    fileName: (params.origName || params['origname'] || params.fileName || params.filename || params.fName),
    revision: params.revision ? parseInt(params.revision, 10) : undefined,
    extra: params.extra
  }
  return {success: true, bsReq: bsReq, attribute: attribute}
}

/**
 * Retrieve blobInfo depending on requested revision. The main purpose is to take store implementation depending on revision
 * Return either success: false with reason or success: true and requested blobInfo & store implementation
 *
 * @param {ParsedRequest} parsedRequest
 * @return {{success: boolean, reason}|{success: boolean, blobInfo: Object, store: BlobStoreCustom}}
 */
function getRequestedBLOBInfo (parsedRequest) {
  let attribute = parsedRequest.attribute
  let entity = attribute.entity
  let ID = parsedRequest.bsReq.ID

  let storeCode, blobInfo
  // dirty request always come to blob store defined in attribute
  if (parsedRequest.bsReq.isDirty) {
    storeCode = attribute.storeName
  } else {
    // check user have access to row and retrieve current blobInfo
    let blobInfoTxt = Repository(entity.code).attrs(attribute.code).where('ID', '=', ID).selectScalar()
    if (!blobInfoTxt) {
      return {
        success: false,
        reason: `${entity.code} with ID=${ID} not accessible`
      }
    }
    blobInfo = JSON.parse(blobInfoTxt)
    // check revision. If not current - get a blobInfo from history
    let rev = parsedRequest.bsReq.revision
    if (rev && (rev !== blobInfo['revision'])) {
      let historicalBlobItem = Repository(BLOB_HISTORY_STORE_NAME)
        .attrs('blobInfo')
        .where('instance', '=', ID)
        .where('attribute', '=', attribute.name)
        .where('revision', '=', rev)
        .selectScalar()
      if (historicalBlobItem) {
        blobInfo = JSON.parse(historicalBlobItem) // use historical blob item
      } else {
        return {
          success: false,
          reason: `Revision ${rev} not found for ${entity.code}.${attribute.code} with ID=${ID}`
        }
      }
    }
    storeCode = (blobInfo && blobInfo.store) ? blobInfo.store : attribute.storeName
  }
  let store = blobStoresMap[storeCode]
  if (!store) {
    return {
      success: false,
      reason: `Store "${storeCode}" not found in application config`
    }
  }
  return {
    success: true,
    blobInfo,
    store
  }
}
/**
 * Retrieve document content from blobStore and send it to response.
 *
 * Accept 3 mandatory parameter: entity,attribute,ID
 * and 3 optional parameter: isDirty, fileName, revision.
 *
 * HTTP method can be either GET - in this case parameters passed in the URL
 * or POST - in this case parameters as JSON in body
 *
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function getDocument (req, resp) {
  /** @type BlobStoreRequest */
  let params
  if (req.method === 'GET') { // TODO - should we handle 'HEAD' here?
    params = queryString.parse(req.parameters)
  } else if (req.method === 'POST') {
    params = JSON.parse(req.read())
  } else {
    return badRequest(resp, 'invalid HTTP verb' + req.method)
  }

  let parsed = parseBlobRequestParams(params)
  if (!parsed.success) return badRequest(resp, parsed.reason)
  let requested = getRequestedBLOBInfo(parsed)
  if (!requested.success) {
    return badRequest(resp, requested.reason)
  }
  // call store implementation method
  return requested.store.fillResponse(parsed.bsReq, requested.blobInfo, req, resp)
}

/**
 * Retrieve BLOB content from blob store.
 * @param {BlobStoreRequest} request
 * @ param {BlobStoreItem} blobInfo JSON retrieved from a DB. `undefinded` for dirty request.
 *   If `undefined` and requested not dirty item then UB will send query to entity and get blobInfo from DB.
 * @param {Object} [options]
 * @param {String|Null} [options.encoding] Default to 'bin'. Possible values: 'bin'|'ascii'|'utf-8'
 * @returns {String|ArrayBuffer}
 */
function getFromBlobStore (request, options) {
  let parsed = parseBlobRequestParams(request)
  if (!parsed.success) throw new Error(parsed.reason)
  let requested = getRequestedBLOBInfo(parsed)
  if (!requested.success) {
    throw new Error(requested.reason)
  }
  return requested.store.getContent(parsed.bsReq, requested.blobInfo, options)
}

/**
 * Got a BLOB content (in the POST request body) and save it to the BLOB store temporary storage.
 * Return a JSON with blob store item info {@link BlobStoreItem}
 *
 * Accept 3 mandatory parameter: entity,attribute,ID
 * and 1 optional parameter: fileName
 *
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function setDocument (req, resp) {
  /** @type BlobStoreRequest */
  let request
  // TODO HTTP 'DELETE'
  if (req.method === 'POST') {
    request = queryString.parse(req.parameters)
  } else {
    return badRequest(resp, 'invalid HTTP verb' + req.method)
  }

  let parsed = parseBlobRequestParams(request)
  if (!parsed.success) return badRequest(resp, parsed.reason)
  let attribute = parsed.attribute
  if (attribute.entity.isUnity) {
    return badRequest(resp, `Direct modification of UNITY entity ${attribute.entity.code} not allowed`)
  }
  let storeCode = attribute.storeName || blobStoresMap.defaultStoreName
  let store = blobStoresMap[storeCode]
  if (!store) return badRequest(resp, `Blob store ${storeCode} not found in application config`)
  let content = req.read('bin')
  let blobStoreItem = store.saveContentToTempStore(parsed.bsReq, attribute, content)
  resp.statusCode = 200
  resp.writeEnd({success: true, errMsg: '', result: blobStoreItem})
}

/**
 * Put content to the temporary path of Blob store
 * @param {BlobStoreRequest} request
 * @param {ArrayBuffer|String} content
 * @return {BlobStoreItem}
 */
function putToBlobStore (request, content) {
  let parsed = parseBlobRequestParams(request)
  if (!parsed.success) throw new Error(parsed.reason)
  let attribute = parsed.attribute
  if (attribute.entity.isUnity) {
    throw new Error(`Direct modification of UNITY entity ${attribute.entity.code} not allowed`)
  }
  let storeCode = attribute.storeName || blobStoresMap.defaultStoreName
  let store = blobStoresMap[storeCode]
  if (!store) throw new Error(`Blob store ${storeCode} not found in application config`)
  return store.saveContentToTempStore(parsed.bsReq, attribute, content)
}

/**
 * @private
 * @param {UBEntityAttribute} attribute
 * @param {BlobStoreItem} blobItem
 * @return {BlobStoreCustom}
 */
function getStore (attribute, blobItem) {
  let storeName = blobItem.store || attribute.storeName
  let store = blobStoresMap[storeName]
  if (!store) throw new Error(`Blob store ${storeName} not found in application config`)
  return store
}

/**
 * History rotation for specified attribute.
 * Will delete expired historical BLOBs and insert a new row into ub_blobHistory with blobInfo content
 * @param {BlobStoreCustom} store
 * @param {UBEntityAttribute} attribute
 * @param {number} ID
 * @param {BlobStoreItem} blobInfo
 */
function rotateHistory (store, attribute, ID, blobInfo) {
  // clear expired historical items (excluding isPermanent)
  let histData = Repository(BLOB_HISTORY_STORE_NAME)
    .attrs(['ID', 'blobInfo'])
    .where('instance', '=', ID)
    .where('attribute', '=', attribute.name)
    .where('permanent', '=', false)
    .orderBy('revision')
    .limit(store.historyDepth)
    .selectAsObject()
  let dataStore = getBlobHistoryDataStore()
  for (let i = 0, L = histData.length; i < L; i++) {
    let item = histData[i]
    let historicalBlobInfo = JSON.parse(item['blobInfo'])
    let store = getStore(attribute, historicalBlobInfo)
    // delete persisted item
    store.doDeletion(attribute, ID, historicalBlobInfo)
    // and information about history from ub_blobHistory
    dataStore.run('delete', {execParams: {ID: item['ID']}})
  }
  let archivedBlobInfo = store.doArchive(attribute, ID, blobInfo)
  // insert new historical item
  dataStore.run('insert', {
    execParams: {
      instance: ID,
      attribute: attribute.name,
      revision: blobInfo.revision,
      permanent: blobInfo.isPermanent,
      blobInfo: JSON.stringify(archivedBlobInfo)
    }
  })
}
/**
 * Move content defined by `dirtyItem` from temporary to permanent store.
 * In case of historical store archive the oldItem.
 * In case `oldItem` is present store implementation should be taken from oldItem.store.
 * Return a new attribute content which describe a place of BLOB in permanent store
 *
 * @param {UBEntityAttribute} attribute
 * @param {Number} ID
 * @param {BlobStoreItem} dirtyItem
 * @param {BlobStoreItem} oldItem
 * @return {BlobStoreItem}
 */
function doCommit (attribute, ID, dirtyItem, oldItem) {
  if (!(dirtyItem.isDirty || dirtyItem.deleting)) {
    throw new Error('Committing of BLOBs allowed either for dirty content or in case of deletion')
  }
  let newRevision = 1
  if (oldItem) { // delete / archive old item
    let store = getStore(attribute, oldItem)
    if (store.historyDepth) {
      rotateHistory(store, attribute, ID, oldItem)
    } else {
      store.doDeletion(attribute, ID, oldItem)
    }
    if (oldItem.revision) newRevision = oldItem.revision + 1
  }
  let store = getStore(attribute, dirtyItem)
  return store.persist(attribute, ID, dirtyItem, newRevision)
}

module.exports = {
  getDocument,
  setDocument,
  getFromBlobStore,
  putToBlobStore,
  doCommit
}
