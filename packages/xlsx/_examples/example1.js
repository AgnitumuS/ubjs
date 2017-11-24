/*
* Created by xmax on 22.11.2017
*/
const fs = require('fs')
const {
  XLSXWorkbook,
  XLSXStyle
} = require('../index')

function startTest () {
  const wb = new XLSXWorkbook()
  wb.useSharedString = false
  let defFont = wb.style.fonts.add({code: 'def', name: 'Calibri', fontSize: 11, scheme: 'minor'})
  let borderFull = wb.style.borders.add({
    left: {style: 'thin'},
    right: {style: 'thin'},
    top: {style: 'thin'},
    bottom: {style: 'thin'}
  })

  // let fillgray125 = wb.style.fills.add({patternType: 'gray125'})
  let fillBG = wb.style.fills.add({fgColor: {rgb: 'FFCFE39D'}})
  let fillBG1 = wb.style.fills.add({fgColor: {rgb: 'fff100'}})
  let alig1 = wb.style.alignments.add({horizontal: 'center', vertical: 'center', wrapText: '1'})
  let formatStyle = wb.style.formats.add('#,##0.00_ ;[Red]\\-#,##0.00\\')

  let fstyle = wb.style.getStyle({font: defFont})
  let fstyle1 = wb.style.getStyle({font: defFont, fill: fillBG})
  let fstyle2 = wb.style.getStyle({font: defFont, fill: fillBG1, alignment: alig1, format: formatStyle})
  let fstyleborderFull = wb.style.getStyle({font: defFont, border: borderFull})
  const ws = wb.addWorkSheet({})
  let columnTemplate = [
    {column: 1, style: fstyle},
    {column: 3, style: fstyle},
    {column: 4, style: fstyleborderFull}
  ]
  ws.addRow([{value: 'test'}, {value: '2'}, {value: 256}], columnTemplate)
  ws.addMerge([1, 2, ws.getRowNum() - 1, ws.getRowNum() - 1])
  let columnTemplate1 = [
    {column: 1, style: fstyle},
    {column: 3, style: fstyle1},
    {column: 4, style: fstyleborderFull}
  ]

  ws.addRow([{value: 'test'}, {value: '2'}, {value: 256}], columnTemplate1)
  ws.addRow([{value: 'test'}, {value: '2'}, {value: 256}], [
    {column: 1, style: fstyle},
    {column: 3, style: fstyle2},
    {column: 4, style: fstyleborderFull}
  ])
  ws.addRow([{value: new Date()}, {value: new Date()}, {value: new Date()}], columnTemplate1)
  let fstyleDate = wb.style.getStyle({font: defFont, format: XLSXStyle.predefinedFormats.dateFull})
  let fstyleDate1 = wb.style.getStyle({font: defFont, format: XLSXStyle.predefinedFormats.date})
  let fstyleDate2 = wb.style.getStyle({font: defFont, format: XLSXStyle.predefinedFormats.dateShort})
  columnTemplate1 = [
    {column: 1, style: fstyleDate},
    {column: 3, style: fstyleDate1},
    {column: 4, style: fstyleDate2}
  ]
  ws.addRow([{value: new Date()}, {value: new Date()}, {value: new Date()}], columnTemplate1)

  wb.render().then(function (content) {
    fs.writeFileSync('./test.xlsx', content, 'binary')
  })
}

module.exports = startTest()
