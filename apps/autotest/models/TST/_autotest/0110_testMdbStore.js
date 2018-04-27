/**
 * @author pavel.mash
 * Date: 06.02.2018
 * Test mdb blob store
 */
const assert = require('assert')
const cmdLineOpt = require('@unitybase/base').options
const argv = require('@unitybase/base').argv

module.exports = function runMDBTest (options) {
  if (!options) {
    let opts = cmdLineOpt.describe('', 'mdb BLOB store test')
      .add(argv.establishConnectionFromCmdLineAttributes._cmdLineParams)
    options = opts.parseVerbose({}, true)
    if (!options) return
  }

  let session = argv.establishConnectionFromCmdLineAttributes(options)
  let conn = session.connection

  console.debug('test ubm_form')
  testUbmForm(conn)
  console.debug('test ubs_report')
  testUbsReport(conn)
  console.debug('test ubm_diagram')
  testUbmDiagram(conn)
}

/**
 * @param {SyncConnection} conn
 */
function testUbmForm (conn) {
  const ENTITY = 'ubm_form'
  let tstClobFormRow = conn.Repository(ENTITY).attrs(['ID', 'code', 'formDef', 'formCode']).where('code', '=', 'tst_clob').selectSingle()
  if (!tstClobFormRow) throw new Error('Form with code `tst_clob` not found')
  let defJson = JSON.parse(tstClobFormRow.formDef)
  let defContent = conn.getDocument({entity: ENTITY, attribute: 'formDef', ID: tstClobFormRow.ID}, {resultIsBinary: true})
  assert.equal(defContent.byteLength, defJson.size, `Size of actual form def content should be the same as stored in metadata`)

  let codeJson = JSON.parse(tstClobFormRow.formCode)
  let codeContent = conn.getDocument({entity: ENTITY, attribute: 'formCode', ID: tstClobFormRow.ID}, {resultIsBinary: true})
  assert.equal(codeContent.byteLength, codeJson.size, `Size of actual form code content should be the same as stored in metadata`)
}

/**
 * @param {SyncConnection} conn
 */
function testUbsReport (conn) {
  const ENTITY = 'ubs_report'
  let reportRow = conn.Repository(ENTITY).attrs(['ID', 'report_code', 'code', 'template']).where('report_code', '=', 'tst_html_to_pdf').selectSingle()
  if (!reportRow) throw new Error('Report with code `tst_html_to_pdf` not found')
  let codeJson = JSON.parse(reportRow.code)
  let codeContent = conn.getDocument({entity: ENTITY, attribute: 'code', ID: reportRow.ID}, {resultIsBinary: true})
  assert.equal(codeContent.byteLength, codeJson.size, `Size of actual report code content should be the same as stored in metadata`)

  let templateJson = JSON.parse(reportRow.template)
  let templateContent = conn.getDocument({entity: ENTITY, attribute: 'template', ID: reportRow.ID}, {resultIsBinary: true})
  assert.equal(templateContent.byteLength, templateJson.size, `Size of actual report template content should be the same as stored in metadata`)
}

/**
 * @param {SyncConnection} conn
 */
function testUbmDiagram (conn) {
  const ENTITY = 'ubm_diagram'
  /** @type {ubm_diagram_object} */
  let diagramRow = conn.Repository(ENTITY).attrs(['ID', 'name', 'document']).where('name', '=', 'tst_entities').selectSingle()
  if (!diagramRow) throw new Error('Diagram with name `tst_html_to_pdf` tst_entities not found')
  let templateJson = JSON.parse(diagramRow.document)
  let templateContent = conn.getDocument({entity: ENTITY, attribute: 'document', ID: diagramRow.ID}, {resultIsBinary: true})
  assert.equal(templateContent.byteLength, templateJson.size, `Size of actual diagram content should be the same as stored in metadata`)
}
