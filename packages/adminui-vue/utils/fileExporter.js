/* global SystemJS, Ext */
const UB = require('@unitybase/ub-pub')

module.exports = {
  exportExcel,
  exportCsv,
  exportHtml
}

/**
 * Generates excel and download it
 *
 * @param {CustomRepository} repository
 * @param {array<UTableColumn>} columns
 * @param {string} fileName
 * @returns {Promise<void>}
 */
async function exportExcel ({ repository, columns, fileName }) {
  const XLSX = await loadXLSX()
  const workbook = new XLSX.XLSXWorkbook()
  workbook.useSharedString = true
  const { font, border } = enrichStyles(workbook.style)
  const getStyle = createStyleGetter({ border, font, styles: workbook.style, XLSX })
  const sheet = workbook.addWorkSheet({ caption: fileName, name: fileName })
  sheet.addMerge({ colFrom: 1, colTo: columns.length })
  sheet.addRow({ value: fileName, column: 1, style: getStyle('header') }, {}, { height: 40 })
  const rowStyles = []
  enrichSheetHeader({ sheet, columns, rowStyles, getStyle })

  const response = await repository.selectAsArray()
  response.resultData.fields = response.fieldList
  const data = UB.LocalDataStore.selectResultToArrayOfObjects(response)

  for (const row of data) {
    sheet.addRow(
      columns.reduce((accum, column) => {
        const value = typeof column.format === 'function'
          ? column.format({ value: row[column.id], row, column })
          : row[column.id]

        accum.push({ value })
        return accum
      }, []),
      rowStyles
    )
  }
  const file = new Blob(
    [workbook.render()],
    { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
  )
  window.saveAs(file, fileName + '.xlsx')
}

/**
 * Generates csv and download it
 *
 * @param {ClientRepository} repository
 * @param {string} fileName
 * @returns {Promise<void>}
 */
async function exportCsv ({ repository, fileName }) {
  // TODO: replace with client side rendering
  const request = repository.clone().withTotal(false).start(0).limit(0)
  const { data } = await request.connection.xhr({
    method: 'POST',
    url: 'ubql',
    data: [request.ubql()],
    responseType: 'blob',
    headers: { 'Content-Type': 'text/csv; charset=UTF-8' }
  })
  window.saveAs(data, `${fileName}.csv`)
}

/**
 * Generates html and download it
 *
 * @param {ClientRepository} repository
 * @param {string} fileName
 * @returns {Promise<void>}
 */
async function exportHtml ({ repository, fileName }) {
  // TODO: replace with client side rendering
  const request = repository.clone().withTotal(false).start(0).limit(0)
  const { data } = await request.connection.xhr({
    method: 'POST',
    url: 'ubql',
    data: [request.ubql()],
    responseType: 'blob',
    headers: { 'Content-Type': 'text/html; charset=UTF-8' }
  })
  window.saveAs(data, `${fileName}.html`)
}

/**
 * Imports XLSX library
 *
 * @returns {Promise<XLSX>}
 */
async function loadXLSX () {
  if (window && !window.isserver && !Ext.ux.exporter.xlsxFormatter.XlsxFormatter.libsLoaded) {
    const injectedXLSX = await SystemJS.import('@unitybase/xlsx/dist/xlsx-all.min.js')
    Ext.ux.exporter.xlsxFormatter.XlsxFormatter.libsLoaded = true
    window.XLSX = injectedXLSX
  }

  return window.XLSX
}

/**
 * Setup basic styles to workbook
 *
 * @param {XLSXStyleController} styles
 * @returns {{border: XLSXStyleControllerBorder, font: XLSXStyleControllerFont}}
 */
function enrichStyles (styles) {
  const font = styles.fonts.add({ code: 'def', name: 'Calibri', fontSize: 11, scheme: 'minor' })
  const border = styles.borders.add({ left: { style: 'thin' }, right: { style: 'thin' }, top: { style: 'thin' }, bottom: { style: 'thin' } })

  // add fonts
  styles.fonts.add({ code: 'defBold', name: 'Calibri', fontSize: 11, scheme: 'minor', bold: true })

  // add alignments
  styles.alignments.add({ code: 'Hright', horizontal: 'right' })
  styles.alignments.add({ code: 'Hcenter', horizontal: 'center', wrapText: '1' })
  styles.alignments.add({ code: 'HVcenter', horizontal: 'center', vertical: 'center', wrapText: '1' })
  styles.alignments.add({ code: 'wrapText', wrapText: '1' })

  // add formats
  styles.formats.add({ code: 'floatFormat', formatCode: '#,##0.0000_ ;[Red]\\-#,##0.0000\\ ' })
  styles.formats.add({ code: 'sumFormat', formatCode: '#,##0.00_ ;[Red]\\-#,##0.00\\ ' })
  styles.formats.add({ code: 'intFormat', formatCode: '#,##0_ ;[Red]\\-#,##0\\ ' })

  return { font, border }
}

/**
 * Enrich header row and rowStyles which used for style data cells
 *
 * @param {XLSXWorksheet} sheet Excel sheet
 * @param {array<UTableColumn>} columns Columns
 * @param {function} getStyle Style getter
 * @param {array} rowStyles Excel row styles
 */
function enrichSheetHeader ({ sheet, columns, getStyle, rowStyles }) {
  const properties = []
  const rowData = []
  properties.push({ column: 0, width: 1 })

  let index = 0
  for (const column of columns) {
    index++
    const type = column.attribute || column.attribute.dataType
    properties.push({ column: index, width: getWide(column.attribute) })
    rowStyles.push({ column: index, style: getStyle(type) })
    rowData.push({ column: index, value: UB.i18n(column.label), style: getStyle('headerRow') })
  }

  sheet.setColsProperties(properties)
  sheet.addRow(rowData, null, { height: 30 })
}

/**
 * Generates style getter
 *
 * @param {XLSXStyleController} styles Workbook styles
 * @param {XLSXStyleControllerFont} font Font style in excel workbook
 * @param {XLSXStyleControllerBorder} border Border style in excel workbook
 * @param {XLSX} XLSX XLSX library
 * @returns {function(string):XLSXStyle} Style getter
 */
function createStyleGetter ({ styles, font, border, XLSX }) {
  return (type) => {
    switch (type) {
      case 'Date':
      case 'DateTime':
        return styles.getStyle({ font, border, format: XLSX.XLSXStyle.indexDefFormateDate, code: 'DefDateStyle' })
      case 'Float':
        return styles.getStyle({ font, border, alignment: styles.alignments.named.Hright, format: styles.formats.named.floatFormat })
      case 'Currency':
        return styles.getStyle({ font, border, alignment: styles.alignments.named.Hright, format: styles.formats.named.sumFormat })
      case 'Int':
        return styles.getStyle({ font, border, alignment: styles.alignments.named.Hright, format: styles.formats.named.intFormat })
      case 'String':
      case 'Text':
        return styles.getStyle({ font, border, alignment: styles.alignments.named.wrapText })
      case 'header':
        return styles.getStyle({ font: styles.fonts.named.defBold, alignment: styles.alignments.named.HVcenter })
      case 'headerRow':
        return styles.getStyle({ font: styles.fonts.named.defBold, fill: 'EBEDED', border, alignment: styles.alignments.named.HVcenter })
      default:
        return styles.getStyle({ font, border })
    }
  }
}

/**
 * @param {UBEntityAttribute} attribute
 * @returns {number} Cell width in excel
 */
function getWide (attribute) {
  if (!attribute) return 18

  switch (attribute.dataType) {
    case 'Date': return 12
    case 'DateTime': return 12
    case 'Float': return 13
    case 'Currency': return 13
    case 'Int': return 10
    case 'Boolean': return 10
    case 'String': return ((attribute.size < 11) ? 10 : (attribute.size < 17) ? 16 : (attribute.size < 26) ? 25 : 30)
    case 'Text': return 50
    default: return 18
  }
}
