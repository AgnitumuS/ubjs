/* global Ext, $App */
const UBDomain = require('@unitybase/cs-shared').UBDomain

/**
 * @class Ext.ux.Exporter.ExcelFormatter
 * @extends Ext.ux.Exporter.Formatter
 * Specialised Format class for outputting .xls files
 */
Ext.define('Ext.ux.exporter.xlsxFormatter.XlsxFormatter', {
  extend: 'Ext.ux.exporter.Formatter',
  contentType: 'data:application/vnd.ms-excel;base64,',
  extension: 'xls',

  sharedStrings: { item: [], count: 0 },

  /**
   * Make export
   * @param {Object} store
   * @param {Object} config
   */
  format: function (store, config) {
    if (window && !window.isserver && !Ext.ux.exporter.xlsxFormatter.XlsxFormatter.libsLoaded) {
      SystemJS.import('@unitybase/xlsx/dist/xlsx-all.min.js').then((injectedXLSX) => {
        window.XLSX = injectedXLSX
        Ext.ux.exporter.xlsxFormatter.XlsxFormatter.libsLoaded = true
        this.format(store, config)
      })
      return
    }
    var
      wb, defFont, ws, stmodel, columnTemplate, fields, nrowData,
      borderFull, fldtitle, datestyleCol, entity, headerStyle, rowHeaderStyle, stl,
      styleWrapCol, styleCol, floatstyleCol, sumstyleCol, intstyleCol, entityName,
      eAttributes, modelFields
    var colParam = []
    var XLSX = window.XLSX
    wb = new XLSX.XLSXWorkbook()
    wb.useSharedString = true
    entity = config.metaobject
    entityName = config.entityName
    if (!entity) {
      entity = $App.domainInfo.get(entityName)
    }
    stl = wb.style

    defFont = stl.fonts.add({ code: 'def', name: 'Calibri', fontSize: 11, scheme: 'minor' })
    stl.fonts.add({ code: 'defBold', name: 'Calibri', fontSize: 11, scheme: 'minor', bold: true })

    borderFull = stl.borders.add({ left: { style: 'thin' }, right: { style: 'thin' }, top: { style: 'thin' }, bottom: { style: 'thin' } })
    stl.alignments.add({ code: 'Hright', horizontal: 'right' })
    stl.alignments.add({ code: 'Hcenter', horizontal: 'center', wrapText: '1' })
    stl.alignments.add({ code: 'HVcenter', horizontal: 'center', vertical: 'center', wrapText: '1' })
    stl.alignments.add({ code: 'wrapText', wrapText: '1' })

    stl.formats.add({ code: 'floatFormat', formatCode: '#,##0.0000_ ;[Red]\\-#,##0.0000\\ ' })
    stl.formats.add({ code: 'sumFormat', formatCode: '#,##0.00_ ;[Red]\\-#,##0.00\\ ' })
    stl.formats.add({ code: 'intFormat', formatCode: '#,##0_ ;[Red]\\-#,##0\\ ' })

    datestyleCol = stl.getStyle({ font: defFont, border: borderFull, format: XLSX.XLSXStyle.indexDefFormateDate, code: 'DefDateStyle' })
    floatstyleCol = stl.getStyle({ font: defFont, border: borderFull, alignment: stl.alignments.named.Hright, format: stl.formats.named.floatFormat })
    sumstyleCol = stl.getStyle({ font: defFont, border: borderFull, alignment: stl.alignments.named.Hright, format: stl.formats.named.sumFormat })
    intstyleCol = stl.getStyle({ font: defFont, border: borderFull, alignment: stl.alignments.named.Hright, format: stl.formats.named.intFormat })

    styleCol = stl.getStyle({ font: defFont, border: borderFull })
    styleWrapCol = stl.getStyle({ font: defFont, border: borderFull, alignment: stl.alignments.named.wrapText })
    headerStyle = stl.getStyle({ font: stl.fonts.named.defBold, alignment: stl.alignments.named.HVcenter })
    rowHeaderStyle = stl.getStyle({ font: stl.fonts.named.defBold, fill: 'EBEDED', border: borderFull, alignment: stl.alignments.named.HVcenter })

    eAttributes = {}
    Ext.each(config.columns, function (field, index) {
      eAttributes[field.dataIndex] = entity.getEntityAttribute(field.dataIndex)
    }, this)

    function getTypeStyle (fld) {
      const attribute = eAttributes[fld.name]
      if (attribute) {
        switch (attribute.dataType) { //   entity.attributes[fld.name].
          case UBDomain.ubDataTypes.Date: return datestyleCol
          case UBDomain.ubDataTypes.DateTime: return datestyleCol
          case UBDomain.ubDataTypes.Float: return floatstyleCol
          case UBDomain.ubDataTypes.Currency: return sumstyleCol
          case UBDomain.ubDataTypes.Int: return intstyleCol
          case UBDomain.ubDataTypes.String: return styleWrapCol
          case UBDomain.ubDataTypes.Text: return styleWrapCol
          default: return styleCol
        }
      }

      switch (fld.type.type) {
        case 'date': return datestyleCol
        case 'float': return floatstyleCol
        case 'int': return intstyleCol
        default: return styleCol
      }
    }

    function getWide (fld) {
      const attribute = eAttributes[fld.name]
      const ubDataTypes = UBDomain.ubDataTypes
      if (attribute) {
        switch (attribute.dataType) { //   entity.attributes[fld.name].
          case ubDataTypes.Date: return 12
          case ubDataTypes.DateTime: return 12
          case ubDataTypes.Float: return 13
          case ubDataTypes.Currency: return 13
          case ubDataTypes.Int: return 10
          case ubDataTypes.Boolean: return 10
          case ubDataTypes.String: return ((attribute.size < 11) ? 10 : (attribute.size < 17) ? 16 : (attribute.size < 26) ? 25 : 30)
          case ubDataTypes.Text: return 50
        }
      }

      switch (fld.type.type) {
        case 'date': return 12
        case 'string': return 25
        case 'float': return 13
        default: return 18
      }
    }

    ws = wb.addWorkSheet({ caption: config.title, name: config.title })

    stmodel = Ext.ModelManager.getModel(store.model)
    fields = stmodel.getFields()
    columnTemplate = []
    nrowData = []

    modelFields = {}
    function getModelField (fieldCode) {
      let modelFld
      Ext.each(fields, function (fld) {
        if (fld.name === fieldCode) {
          modelFld = fld
          return 0
        }
      }, this)
      return modelFld
    }
    Ext.each(config.columns, function (field, index) {
      modelFields[field.dataIndex] = getModelField(field.dataIndex)
    }, this)

    // title ##################################################
    ws.addMerge({ colFrom: 1, colTo: config.columns.length })
    ws.addRow({ value: config.title, column: 1, style: headerStyle }, {}, { height: 40 })

    // Header cells ##################################################
    /* auto (Default, implies no conversion) string int float boolean date */
    colParam.push({ column: 0, width: 1 })
    Ext.each(config.columns, function (field, index) {
      const fld = modelFields[field.dataIndex]
      colParam.push({ column: index + 1, width: getWide(fld) })
      columnTemplate.push({ column: index + 1, style: getTypeStyle(fld) })
      fldtitle = Ext.String.capitalize(field.text || fld.name || '').replace(/_/g, ' ')
      nrowData.push({ column: index + 1, value: fldtitle, style: rowHeaderStyle })
    }, this)
    ws.setColsProperties(colParam)
    // Header
    ws.addRow(nrowData, null, { height: 30 })

    function formatValue (fld, fvalue, dataRow, recordIndex, origRowData) {
      let value
      if (entity) {
        switch (eAttributes[fld.dataIndex].dataType) {
          case UBDomain.ubDataTypes.Date:
          case UBDomain.ubDataTypes.DateTime:
          case UBDomain.ubDataTypes.Float:
          case UBDomain.ubDataTypes.Currency:
          case UBDomain.ubDataTypes.Int: value = fvalue
        }
      }
      if (!value) {
        if (typeof fld.renderer === 'function') {
          value = fld.renderer(fvalue, null, origRowData, recordIndex, fld.dataIndex, store)
          value = Ext.String.htmlDecode(value)
        } else {
          value = fvalue
        }
      }
      dataRow.push({ value: value })
    }

    // data row  ##################################################
    if (store.isRawData) {
      Ext.Array.each(store.data,
        function (fdata, index) {
          nrowData = []
          Ext.each(config.columns, function (fld) {
            formatValue(fld, fdata[store.dataFieldsMap[fld.dataIndex]], nrowData, index, fdata)
          }, this)
          ws.addRow(nrowData, columnTemplate)
        }, this)
    } else {
      store.each(function (record, index) {
        nrowData = []
        Ext.each(config.columns, function (fld) {
          formatValue(fld, record.get(fld.dataIndex), nrowData, index, record)
        }, this)
        ws.addRow(nrowData, columnTemplate)
      }, this)
    }
    // var rData = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," + wb.render();
    const result = wb.render()
    config.callback.call(config.scope, result)
  }
})
