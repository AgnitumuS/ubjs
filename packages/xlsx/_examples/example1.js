/*
* Created by xmax on 22.11.2017
*/
const fs = require('fs')
const {
  XLSXWorkbook
} = require('../index')

function startTest () {
  const wb = new XLSXWorkbook()
  wb.useSharedString = false
  var defFont = wb.style.fonts.add({code: 'def', name: 'Calibri', fontSize: 11, scheme: 'minor'})
  var borderFull = wb.style.borders.add({
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

  var fstyle = wb.style.getStyle({font: defFont})
  var fstyle1 = wb.style.getStyle({font: defFont, fill: fillBG})
  var fstyle2 = wb.style.getStyle({font: defFont, fill: fillBG1, alignment: alig1, format: formatStyle})
  var fstyleborderFull = wb.style.getStyle({font: defFont, border: borderFull})
  const ws = wb.addWorkSheet({})
  var columnTemplate = [
    {column: 1, style: fstyle},
    {column: 3, style: fstyle},
    {column: 4, style: fstyleborderFull}
  ]
  ws.addRow([{value: 'test'}, {value: '2'}, {value: 256}], columnTemplate)
  ws.addMerge([1, 2, ws.getRowNum() - 1, ws.getRowNum() - 1])
  var columnTemplate1 = [
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

  wb.render()
  .then(function (content) {
    fs.writeFileSync('./test.xlsx', content, 'binary')
  })
}

module.exports = startTest()
