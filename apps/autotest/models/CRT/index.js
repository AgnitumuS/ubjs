const iitCrypto = require('@ub-d/iit-crypto')
const assert = require('assert')
// const cryptoService = require('@ub-d/crypto-service').cryptoService
// App.registerEndpoint('cryptoService', cryptoService, false)

App.registerEndpoint('testIIT', testIIT, false)

/**
 * Call IIT verify for test file
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function testIIT (req, resp) {
  // file below placed into store by function testServerSideBLOB
  const DOC_CODE = '2014-01-01'
  const DOC_ENTITY = 'tst_document'
  const DOC_ATTRIBUTE = 'fileStoreSimple'
  const ID = UB.Repository(DOC_ENTITY).attrs('ID').where('code', '=', DOC_CODE).selectScalar()

  const content = App.blobStores.getContent({ ID, entity: DOC_ENTITY, attribute: DOC_ATTRIBUTE })
  assert.ok(content.byteLength, `${DOC_ENTITY} BLOB store for code ${DOC_CODE} should not be empty`)

  const signature = iitCrypto.sign(content)
  const storeFilePath = App.blobStores.getContentPath({ ID, entity: DOC_ENTITY, attribute: DOC_ATTRIBUTE })

  const verifyResult = iitCrypto.verify(signature, storeFilePath)
  if (!verifyResult.valid) {
    console.error('Signed from memory but verified from file should be valid')
    resp.statusCode = 500
  } else {
    resp.statusCode = 200
  }
  resp.writeEnd(verifyResult)
}
