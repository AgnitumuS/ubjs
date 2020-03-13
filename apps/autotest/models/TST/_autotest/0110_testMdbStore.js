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
    const opts = cmdLineOpt.describe('', 'mdb BLOB store test')
      .add(argv.establishConnectionFromCmdLineAttributes._cmdLineParams)
    options = opts.parseVerbose({}, true)
    if (!options) return
  }

  const session = argv.establishConnectionFromCmdLineAttributes(options)
  const conn = session.connection

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
  const tstClobFormRow = conn.Repository(ENTITY).attrs(['ID', 'code', 'formDef', 'formCode']).where('code', '=', 'tst_clob').selectSingle()
  if (!tstClobFormRow) throw new Error('Form with code `tst_clob` not found')
  const defJson = JSON.parse(tstClobFormRow.formDef)
  const defContent = conn.getDocument({ entity: ENTITY, attribute: 'formDef', ID: tstClobFormRow.ID }, { resultIsBinary: true })
  assert.strictEqual(defContent.byteLength, defJson.size, `Size of actual 'tst_clob' form def content (${defContent.byteLength} should be the same as stored in metadata (${defJson.size})`)

  const codeJson = JSON.parse(tstClobFormRow.formCode)
  const codeContent = conn.getDocument({ entity: ENTITY, attribute: 'formCode', ID: tstClobFormRow.ID }, { resultIsBinary: true })
  assert.strictEqual(codeContent.byteLength, codeJson.size, `Size of actual 'tst_clob' form code content (${defContent.byteLength} should be the same as stored in metadata (${codeJson.size})`)
}

/**
 * @param {SyncConnection} conn
 */
function testUbsReport (conn) {
  const ENTITY = 'ubs_report'
  const reportRow = conn.Repository(ENTITY).attrs(['ID', 'report_code', 'code', 'template']).where('report_code', '=', 'tst_html_to_pdf').selectSingle()
  if (!reportRow) throw new Error('Report with code `tst_html_to_pdf` not found')
  const codeJson = JSON.parse(reportRow.code)
  const codeContent = conn.getDocument({ entity: ENTITY, attribute: 'code', ID: reportRow.ID }, { resultIsBinary: true })
  assert.strictEqual(codeContent.byteLength, codeJson.size, 'Size of actual report code content should be the same as stored in metadata')

  const templateJson = JSON.parse(reportRow.template)
  const templateContent = conn.getDocument({ entity: ENTITY, attribute: 'template', ID: reportRow.ID }, { resultIsBinary: true })
  assert.strictEqual(templateContent.byteLength, templateJson.size, 'Size of actual report template content should be the same as stored in metadata')
}

/**
 * @param {SyncConnection} conn
 */
function testUbmDiagram (conn) {
  const ENTITY = 'ubm_diagram'
  /** @type {ubm_diagram_object} */
  const diagramRow = conn.Repository(ENTITY).attrs(['ID', 'name', 'document']).where('name', '=', 'tst_entities').selectSingle()
  if (!diagramRow) throw new Error('Diagram with name `tst_html_to_pdf` tst_entities not found')
  const templateJson = JSON.parse(diagramRow.document)
  const templateContent = conn.getDocument({ entity: ENTITY, attribute: 'document', ID: diagramRow.ID }, { resultIsBinary: true })
  assert.strictEqual(templateContent.byteLength, templateJson.size, 'Size of actual diagram content should be the same as stored in metadata')
}
