const noErrorsResponse = {error: 0}
const asString = JSON.stringify(noErrorsResponse)

/**
 * Required by onlyOffice. If not exists, will throw UI errors on save/autosave
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function notifyDocumentSaved (req, resp) {
  // used to notify document server that everything is ok
  // indeed ok we don't do anything here
  resp.statusCode = 200
  resp.writeEnd(asString)
}

module.exports = notifyDocumentSaved

/**
 * @typedef {object} t_notifyDocumentSaved_req_body
 * @property {string} key - document identifier
 * @property {number} status - editing result
 * @property {string} url - link to resulting document
 * @property {string} userdata - custom information (information about document)
 * @property {string[]} users - list of users responsible for changes
 * @property {boolean} notmodified - document were actually changed
 */
