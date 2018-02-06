const App = require('../modules/App')
const UBDomain = require('@unitybase/base').UBDomain
const Repository = require('@unitybase/base').ServerRepository.fabric
const queryString = require('querystring')
const {badRequest, notFound} = require('../modules/httpUtils')

function createBlobStoreMap () {
  let blobStores = App.serverConfig.application.blobStores
  let res = {}
  if (!blobStores) return
  blobStores.forEach((store) => {
    res[store.name] = store
    let storeImplementationModule = store['implementedBy']
    // UB4 compatibility
    if (!storeImplementationModule && (!store.storeType || store.name === 'fileVirtual')) {
      storeImplementationModule = '../blobStores/fileSystemBlobStore'
    }
    if (!storeImplementationModule && (store.name = 'mdb')) {
      storeImplementationModule = '../blobStores/mdbBlobStore'
    }
    if (storeImplementationModule === 'fileVirtualWritePDF') {
      storeImplementationModule = '../blobStores/fileVirtualWritePDF'
    }
    if (!storeImplementationModule) storeImplementationModule = '../blobStores/fileSystemBlobStore'

    if (store.isDefault) res.defaultStoreName = store.name
    /**
     * Store implementation
     */
    store.implementation = require(storeImplementationModule)
  })
  return res
}
const blobStoresMap = createBlobStoreMap()

/**
 * Check params contains entity,attribute & ID.
 * Entity should be in domain, attribute should be of `Documant` type and ID should be Number
 * In case params are invalid return false (and write an error in resp)
 *
 * @param {BlobStoreRequest} params
 * @return {Object<success: false, reason: string>|Object<success: true, entity: UBEntity, attribute: UBEntityAttribute, ID: Number>}
 */
function parseBlobRequestParams (params) {
  if (!params.entity || !params.attribute || !params.ID) {
    return {success: false, reason: 'one of required parameters (entity,attribute,ID) not found'}
  }
  let ID = parseInt(params.ID)
  if (ID <= 0) return {success: false, reason: 'incorrect ID value'}

  let entity = App.domainInfo.get(params.entity)
  let attribute = entity.getAttribute(params.attribute)
  if (attribute.dataType !== UBDomain.ubDataTypes.Document) {
    return {success: false, reason: `Invalid getDocument Request to non-document attribute ${params.entity}.${params.attribute}`}
  }
  return {success: true, entity, attribute, ID}
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
  let {entity, attribute, ID} = parsed

  let blobInfoTxt = Repository(entity.code).attrs(attribute.code).where('ID', '=', ID).selectScalar()
  if (!blobInfoTxt) return notFound(resp, `${entity.code} with ID=${ID}`)
  let blobInfo = JSON.parse(blobInfoTxt)
  // first try to get a store code from blobInfo
  let storeCode = blobInfo.store ? blobInfo.store : attribute.storeName
  let store = blobStoresMap[storeCode]
  if (!store) return badRequest(resp, `Blob store ${storeCode} not found in application config`)
  // call store implementation method
  return store.implementation.fillResponse(params, blobInfo, req, resp)
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
  let {entity, /** @type UBEntityAttribute */attribute} = parsed
  if (attribute.entity.isUnity) {
    return badRequest(resp, `Direct modification of UNITY entity ${entity.code} not allowed`)
  }
  let storeCode = attribute.storeName || blobStoresMap.defaultStoreName
  let store = blobStoresMap[storeCode]
  if (!store) return badRequest(resp, `Blob store ${storeCode} not found in application config`)
  let content = req.read('bin')
  let blobStoreItem = store.implementation.saveContentToTempStore(request, attribute, content)
  resp.statusCode = 200
  resp.writeEnd({result: blobStoreItem})
}

/**
 * Retrieve BLOB content from blob store.
 * @param {BlobStoreRequest} request
 * @param {BlobStoreItem} blobInfo JSON retrieved from a DB.
 *   If `undefined` UB will send query to entity anf get it from DB.
 *   At last one parameter {store: storeName} should be defined to prevent loading actual JSON from DB
 * @param {Object} [options]
 * @param {String|Null} [options.encoding] Default to 'bin'. Possible values: 'bin'|'ascii'|'utf-8'
 * @returns {String|ArrayBuffer}
 */
function getFromBlobStore (request, blobInfo, options) {
  let parsed = parseBlobRequestParams(request)
  if (!parsed.success) throw new Error(parsed.reason)
  // A blob store code MUST be taken from BlobStoreItem - this required by store rotation mechanism
  let storeCode
  if (blobInfo && blobInfo.store) {
    storeCode = blobInfo.store
  } else {
    let row = Repository(request.entity).attrs(['ID', request.attribute]).where('ID', '=', request.ID).selectSingle()
    if (row && row[request.attribute]) {
      blobInfo = JSON.parse(row[request.attribute])
      storeCode = blobInfo.store
    }
    if (!storeCode) storeCode = parsed.attribute.storeName
  }
  let store = blobStoresMap[storeCode]
  if (!store) throw new Error(`Blob store ${storeCode} not found in application config`)
  // call store implementation method
  return store.implementation.getContent(request, blobInfo, options)
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
  let {entity, /** @type UBEntityAttribute */attribute} = parsed
  if (attribute.entity.isUnity) {
    throw new Error(`Direct modification of UNITY entity ${entity.code} not allowed`)
  }
  let storeCode = attribute.storeName || blobStoresMap.defaultStoreName
  let store = blobStoresMap[storeCode]
  if (!store) throw new Error(`Blob store ${storeCode} not found in application config`)
  return store.implementation.saveContentToTempStore(request, attribute, content)
}

/**
 * Move content defined by `dirtyItem` from temporary to permanent store.
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
  let storeName = oldItem ? oldItem.store : attribute.storeName
  if (!storeName) storeName = blobStoresMap.defaultStoreName
  let store = blobStoresMap[storeName]
  if (!store) throw new Error(`Blob store ${storeName} not found in application config`)
  return store.implementation.doCommit(attribute, ID, dirtyItem, oldItem)
}

module.exports = {
  getDocument,
  setDocument,
  getFromBlobStore,
  putToBlobStore,
  doCommit
}
