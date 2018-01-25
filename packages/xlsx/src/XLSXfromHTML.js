const fontsMap = {}
const ReachText = require('./ReachText')
const {SpanMap} = require('./SpanMap')

/**
 * This class used for extract value for html tag td and convert it to reachText
 */
class CellValue {
  /**
   *
   * @param rootNode
   * @return {ReachText}
   */
  static getValue (rootNode) {
    const cv = new CellValue(rootNode)
    return cv.getValue()
  }

  constructor (rootNode) {
    this.rootNode = rootNode
    this.items = []
    this.reachText = new ReachText()
    this.useReachText = false
    this.reachInfo = null
  }

  /**
   *
   * @return {ReachText}
   */
  getValue () {
    for (let i = 0; i < this.rootNode.childNodes.length; ++i) {
      let childNode = this.rootNode.childNodes[i]
      this.addValue(childNode)
    }
    return this.useReachText ? this.reachText : (this.items.length > 0 ? this.items.join(',') : null)
  }

  addValue (node) {
    let value = node.nodeValue
    if (!node.childNodes && value !== null && value !== undefined) {
      if (this.reachInfo || this.useReachText) {
        if (!this.useReachText && this.items.length > 0) {
          this.items.forEach(F => this.reachText.addText(F))
          this.items = null
        }
        this.useReachText = true
        this.reachText.addText(value, this.reachInfo)
      } else {
        this.items.push(value)
      }
      return
    }
    let nodeInfo = (node.nodeName === '#text') ? null : getTagInfo(node)
    let reachInfo = nodeInfo ? tagInfoToReachTextConfig(nodeInfo) : null
    let masterReachInfo = this.reachInfo
    if (reachInfo) {
      if (masterReachInfo) {
        this.reachInfo = Object.assign({}, masterReachInfo)
      }
      this.reachInfo = Object.assign(this.reachInfo || {}, reachInfo)
    }
    for (let i = 0; i < node.childNodes.length; ++i) {
      let childNode = node.childNodes[i]
      this.addValue(childNode)
    }
    this.reachInfo = masterReachInfo
  }
}

function mustacheFdExec (val, render) {
  const me = this
  let data = render(val)
  if (!data) return data
  let dataArr = JSON.parse('[' + data + ']')
  if (dataArr < 1) {
    throw new Error('$fd function require one or two parameter. {{#$fd}}"dateReg","dd.mm.yyyy"{{/fd}} ')
  }
  return XLSXfromHTML.formatValue(me[dataArr[0]], dataArr.length > 1 ? dataArr[1] : null)
}

function mustacheFdFactory () {
  return mustacheFdExec
}

function mustacheFnExec (val, render) {
  const me = this
  let data = render(val)
  if (!data) return data
  let dataArr = JSON.parse('[' + data + ']')
  if (dataArr < 1) {
    throw new Error('$format function require one or two parameter. {{#$fn}}"sum"{{/fn}} {{#$fn}}"sum","0,00"{{/fn}} ')
  }
  return XLSXfromHTML.formatValue(me[dataArr[0]], dataArr.length > 1 ? dataArr[1] : null)
}

function mustacheFnFactory () {
  return mustacheFnExec
}

class XLSXfromHTML {
  /**
   *
   * @param {xmldom.DOMParser} DOMParser Class factory
   * @param {XLSXWorkbook} workBook
   * @param {Object} [sheetConfig] Config for XLSXWorkbook.addWorkSheet. You can see full list of config parameters in {@link XLSXWorkbook.addWorkSheet XLSXWorkbook.addWorkSheet}.
   * @param {String} [sheetConfig.title='Worksheet']
   * @param {String} [sheetConfig.name='Лист']
   * @param {String} [sheetConfig.setActive=false]
   */
  constructor (DOMParser, workBook, sheetConfig) {
    this.parser = new DOMParser()
    this.wb = workBook
    this.sheetConfig = sheetConfig
  }

  /**
   * Convert any primitives data type value to format XLSXfromHTML compatible
   * @param {Primitives} value
   * @param {String} format
   * @return {String}
   */
  static formatValue (value, format) {
    let result
    let valueType = typeof value
    if (valueType === 'object' && value instanceof Date) {
      valueType = 'datetime'
    }
    switch (valueType) {
      case 'datetime':
        result = `${formatPrefix}d${value.getTime()}`
        break
      case 'number':
        result = `${formatPrefix}n${String(value)}`
        break
      default:
        result = (value !== null && value !== undefined) ? String(value) : ''
        format = null
    }
    if (result && format) {
      result += formatPrefix + 'f' + format
    }
    return result
  }

  static addMustacheSysFunction (data) {
    if (typeof data !== 'object') throw new Error('Invalid param data type')
    data.$fd = mustacheFdFactory.bind(data)
    data.$fd = mustacheFnFactory.bind(data)
    data.$f = mustacheFnFactory.bind(data)
  }

  writeHtml (config) {
    if (!config.html) throw new Error('Empty config.html')
    let html = removeEntities(config.html)
    html = html.replace(/(\r|\n)/g, '')

    let root = this.parser.parseFromString('<xmn>' + html + '</xmn>', 'application/xml').documentElement
    if (root.childNodes && root.childNodes.length > 0 && root.childNodes[0].nodeName === 'parsererror') {
      throw new Error(root.childNodes[0].innerHTML)
    }

    let tables = []
    findNode(root, 'table', tables, true)
    if (tables.length === 0) {
      throw new Error('Table tag not found')
    }

    tables.forEach((F, idx) => {
      let cfg = {title: 'Worksheet', name: 'Лист', setActive: false}
      Object.assign(cfg, this.sheetConfig)
      if (idx > 0) {
        cfg.name += ' ' + idx
        cfg.title += ' ' + idx
      }
      let ws = this.wb.addWorkSheet(cfg)
      this.writeTable(ws, F, config)
    })
  }

  /**
   *
   * @param ws
   * @param node
   * @param config
   */
  writeTable (ws, node, config) {
    let rows = []
    let rowIndex = config.startRowIndex || 0
    let ctxt = { tableInfo: getTagInfo(node), config: config }
    ctxt.tableStyle = styleToXlsx(ctxt.tableInfo)
    ctxt.colWidth = []
    ctxt.spanMap = new SpanMap(ctxt.tableInfo.style.width)
    findNode(node, 'tr', rows, true)
    rows.forEach(F => {
      this.writeRow(ws, F, rowIndex, ctxt)
      rowIndex++
    })
    let widths = ctxt.spanMap.getWidths()
    widths = widths.map((F, i) => { return F ? {column: i, width: F} : null }).filter(F => F)
    if (widths.length) {
      ws.setColsProperties(widths)
    }
  }

  /**
   *
   * @param ws
   * @param node
   * @param index
   * @param ctxt
   */
  writeRow (ws, node, index, ctxt) {
    let cells = []
    let trInfo = getTagInfo(node)
    let minHeight = trInfo.style.height || trInfo.style.minHeight || 0
    let trStyle = styleToXlsx(trInfo)
    let startRow = ctxt.config.startRow || 0
    let colWidth = []

    findNode(node, 'td', cells)
    let columnNum = startRow
    // let collIdx = 0
    // let rowData = []
    let cellsData = cells.map(F => {
      let cellInfo = {}
      cellInfo.value = CellValue.getValue(F)
      let typedValue = getTypedValue(cellInfo.value)
      let valueStyle = {}
      if (typedValue) {
        cellInfo.value = typedValue.value
        if (typedValue.format) {
          valueStyle = {format: typedValue.format}
        }
      }
      let tdInfo = getTagInfo(F)
      let colSpan = getAttributeInt(F, 'colspan')
      if (colSpan) cellInfo.cellStyle = {colSpan: colSpan}
      let rowSpan = getAttributeInt(F, 'rowspan')
      if (rowSpan) {
        cellInfo.cellStyle = cellInfo.cellStyle || {}
        cellInfo.rowSpan = rowSpan
      }
      let tdMinHeight = tdInfo.style.height || tdInfo.style.minHeight
      if (tdMinHeight && tdMinHeight > minHeight) minHeight = tdMinHeight
      colWidth.push({rowSpan, colSpan, width: tdInfo.style.width, widthPercent: tdInfo.style.widthPercent})
      cellInfo.style = getStyleByHtml(ws.workBook, [valueStyle, styleToXlsx(tdInfo), trStyle, ctxt.tableStyle])
      cellInfo.column = columnNum
      columnNum = ctxt.spanMap.getNextCellNum(columnNum, colSpan)
      // columnNum++
      return cellInfo
    })
    ctxt.spanMap.addRow(colWidth)
    ws.addRow(cellsData, null, minHeight ? {height: minHeight} : null)
  }
}

const formatPrefix = '##$'
const formatPrefixLen = formatPrefix.length

/**
 * For date use (new Date()).getTime()
 * For number use String(1234.11)
 * ##$d1516790542564##$fdd.mm.yyyy
 *    ##$ - prefix
 *    d - type must be d (dateTime) or n (Number)
 *    $f - optional show format
 * @param {String} value
 * @return {*}
 */
function getTypedValue (value) {
  if ((typeof value !== 'string') || value.length <= formatPrefixLen) return null
  if (value.substr(0, formatPrefixLen) === formatPrefix) {
    let dataType = value.substr(formatPrefixLen, 1)
    let dataValue = value.substr(formatPrefixLen + 1)
    let dataFormat
    dataValue = dataValue.split(formatPrefix + 'f')
    if (dataValue.length > 1) {
      dataFormat = dataValue[1]
    }
    dataValue = dataValue[0]
    switch (dataType) {
      case 'd':
        dataValue = new Date(Number(dataValue))
        break
      case 'n':
        dataValue = Number(dataValue)
        break
    }
    return {value: dataValue, format: dataFormat, dataType}
  }
  return null
}

function tagInfoToReachTextConfig (tagInfo) {
  if (!tagInfo || !tagInfo.style) return null
  let res = {}
  if (tagInfo.style.font.weight === 'bold') res.bold = true
  if (tagInfo.style.font.style === 'italic') res.italic = true
  if (tagInfo.style.font.name) {
    res.font = tagInfo.style.font.name
  }
  if (tagInfo.style.font.fontSize) {
    res.fontSize = tagInfo.style.font.fontSize
  }
  if (tagInfo.style.font.color) {
    res.color = tagInfo.style.font.color
  }
  if (tagInfo.style.textDecoration === 'line-through') res.strike = true
  if (tagInfo.style.textDecoration === 'underline') res.underline = 'single'
  return res
}

function findNode (node, key, items, deep) {
  if (!node.childNodes) return
  for (let nodeIndex = 0; nodeIndex < node.childNodes.length; nodeIndex++) {
    let nc = node.childNodes[nodeIndex]
    let nodeName = nc.nodeName.toLowerCase()
    if (nodeName === key) {
      items.push(nc)
    } else if (deep) {
      findNode(nc, key, items, deep)
    }
  }
}

function getFontNameByHtmlName (htmlName) {
  if (!htmlName) return htmlName
  let res = null
  let xName
  htmlName.split(',').every(function (name) {
    xName = name.trim()
    if (xName[0] === '"') {
      xName = xName.substring(1, xName.length - 1)
    }
    res = fontsMap[xName]
    return !res
  })
  return res || xName
}

function parseStyle (node) {
  if (!node.attributes) {
    return {}
  }
  let styleStr = node.attributes.getNamedItem('style')
  if (!styleStr || !styleStr.value) {
    return {}
  }
  let result = {}
  styleStr.value.split(';').forEach(function (elementStr) {
    if (!elementStr) return
    let pair = elementStr.split(':')
    if (pair.length < 2) {
      return
    }
    result[pair[0].trim()] = pair[1].trim()
  })
  return result
}

function convertToMeasure (value, measure, horizontal) {
  if (!value) return value
  switch (measure) {
    case 'px':
    case 'pt':
      return horizontal ? value * 13.75 / 100 : value * 3 / 4 // 72 / 25.4
    case 'cm':
    case 'mm':
      return value
    default:
      return horizontal ? value * 13.75 / 100 : value * 3 / 4 // 72 / 25.4
      // throw new Error('Unknown measure ' + measure)
  }
}

function toXLSMeasure (styleProp, options) {
  if (!styleProp) return 0
  let val = styleProp
  if (typeof (val) !== 'string') {
    val = val + ''
  }
  val = val.trim()
  if (val.substr(-1) === '%') {
    if (!options || options.banPercent) {
      throw new Error('% is not supported metric for font-size')
    } else {
      if (options) options.isPercent = true
    }
  }
  val = parseInt(val, 10)
  if (val === 0) return val
  if (Number.isNaN(val)) return null  // do not throw error
  return convertToMeasure(val, 'px', options.horizontal)
}

function setDefaultNodeStyle (info, node) {
  switch (node.nodeName.toLowerCase()) {
    case 'em':
    case 'i':
      info.style.font.style = 'italic'
      break
    case 'strong':
    case 'b':
      info.style.font.weight = 'bold'
      break
  }
}

function getTagInfo (node) {
  let info = {}
  info.styleProps = parseStyle(node)
  info.style = getStyleProp(info.styleProps)
  info.border = getBorderInfo(info.styleProps)
  info.padding = getPaddingInfo(info.styleProps)
  info.margin = getMarginInfo(info.styleProps)
  setDefaultNodeStyle(info, node)
  return info
}

function getStyleByHtml (wb, styles) {
  let config = {}
  styles.reverse().forEach(F => {
    Object.assign(config, F)
  })
  return wb.style.getStyle(config)
}

/**
 * Convert html align to xlsx
 * @param align
 * @return {*}
 */
function decodeAlign (align) {
  if (!align) return align
  // start | end | left | right | center | justify | match-parent
  // (general | left | center | right | fill | justify | centerContinuous | distributed)
  switch (align) {
    case 'start':
    case 'left': return 'left'
    case 'end':
    case 'right': return 'right'
    case 'center': return 'center'
    case 'justify': return 'justify'
    default: return 'general'
  }
}

/**
 * Decode html vertical align
 * @param align
 * @return {*}
 */
function decodeVAlign (align) {
  if (!align) return align
 // baseline | sub | super | text-top | text-bottom | middle | top | bottom
 // top | center | bottom | justify distributed
  switch (align) {
    case 'baseline':
    case 'sub':
    case 'text-top':
    case 'super':
    case 'top': return 'top'
    case 'text-bottom':
    case 'bottom': return 'bottom'
    case 'middle': return 'center'
    default: return 'top'
  }
}

function styleToXlsx (htmlStyleInfo) {
  let config = {}
  if (htmlStyleInfo.style.backgroundColor) {
    config.fill = htmlStyleInfo.style.backgroundColor
  }
  if (htmlStyleInfo.style.font) {
    let font = htmlStyleInfo.style.font
    config.font = {}
    if (font.name) config.font.name = font.name
    if (font.weight) config.font.bold = font.weight === 'bold'
    if (font.style) config.font.italic = font.style === 'italic'
    if (font.color) config.font.color = font.color
    if (font.size) config.font.fontSize = font.size
  }
  if (htmlStyleInfo.style.textDecoration) {
    config.font = config.font || {}
    // line-through, overline, underline
    if (htmlStyleInfo.style.textDecoration === 'line-through') config.font.strike = true
    if (htmlStyleInfo.style.textDecoration === 'underline') config.font.underline = 'single'
  }
  if (htmlStyleInfo.style.textRotation) {
    config.alignment = config.alignment || {}
    config.alignment.textRotation = parseInt(htmlStyleInfo.style.textRotation, 10)
  }
  if (htmlStyleInfo.style.align) {
    config.alignment = config.alignment || {}
    config.alignment.horizontal = decodeAlign(htmlStyleInfo.style.align)
  }
  if (htmlStyleInfo.style.verticalAlign) {
    config.alignment = config.alignment || {}
    config.alignment.vertical = decodeVAlign(htmlStyleInfo.style.verticalAlign)
  }
  setBorderItem(htmlStyleInfo.border, config, 'top')
  setBorderItem(htmlStyleInfo.border, config, 'bottom')
  setBorderItem(htmlStyleInfo.border, config, 'left')
  setBorderItem(htmlStyleInfo.border, config, 'right')

  return config
}

function setBorderItem (item, config, type) {
  if (item[type]) {
    config.border = config.border || {}
    config.border[type] = {}
    config.border[type].style = htmlBorderStyle2XLSX(item[type].style)
    if (item[type].color) {
      config.border[type].color = item[type].color
    }
  }
}

function htmlBorderStyle2XLSX (htmlStyle) {
  // "none","thin","medium","dashed","dotted","thick","double","hair","mediumDashed","dashDot","mediumDashDot","dashDotDot","mediumDashDotDot","slantDashDot"
  // none | hidden | dotted | dashed | solid | double | groove | ridge | inset | outset
  switch (htmlStyle) {
    case 'hidden':
    case 'none': return 'none'
    case 'dotted': return 'dotted'
    case 'dashed': return 'dashed'
    case 'solid': return 'thin'
    case 'groove':
    case 'ridge':
    case 'inset':
    case 'outset':
    case 'double': return 'double'
    default: return 'none'
  }
}

const RErotateDeg = /^rotate\((.*)deg\)$/

function getStyleProp (style) {
  let res = {
    font: {}
  }
  if (style['font-family']) {
    res.font.name = style['font-family']
    res.font.name = getFontNameByHtmlName(res.font.name) || res.font.name
  }
  let tmp
  if (style['font-weight']) {
    tmp = style['font-weight']
    if (tmp) {
      res.font.weight = tmp
      if (tmp !== 'normal') {
        res.font.weight = 'bold'
      }
    }
  }
  if (style['font-style']) {
    tmp = style['font-style']
    if (tmp) {
      res.font.style = tmp
      if (tmp !== 'normal') {
        res.font.style = (res.font.style || '') + 'italic'
      }
    }
  }
  if (style.color) {
    res.font.color = style.color
  }
  if (style['font-size']) {
    tmp = style['font-size']
    if (tmp && tmp !== 'normal') {
      res.font.size = parseFloat(tmp)
    }
  }
  if (style['text-decoration']) {
    tmp = style['text-decoration']
    if (tmp && tmp !== 'none') {
      res.textDecoration = style['text-decoration']
    }
  }
  if (style['transform']) {
    tmp = style['transform']
    let rotateDeg = tmp.match(RErotateDeg)
    if (rotateDeg && rotateDeg[1]) {
      res.textRotation = rotateDeg[1]
    }
  }

  // cfg.color || pBlock.font.color);
  if (style['text-align']) {
    res.align = style['text-align']
  }
  if (style['vertical-align']) {
    res.verticalAlign = style['vertical-align']
  }
  if (style['text-indent']) {
    res.textIndent = toXLSMeasure(style['text-indent'])
  }
  if (style['background-color']) {
    res.backgroundColor = style['background-color']
  }

  if (style['list-style']) {
    tmp = style['list-style']
    let tmpArr = tmp.trim().split(' ')
    switch (tmpArr.length) {
      case 1:
        res.listStyleType = tmpArr[0]
        break
      case 2:
      case 3:
        res.listStyleType = tmpArr[0]
        res.listStylePosition = tmpArr[1]
        break
    }
  }

  if (style['list-style-position']) {
    res.listStylePosition = style['list-style-position']
  }
  if (style['list-style-type']) {
    res.listStyleType = style['list-style-type']
  }

  if (style.width) {
    tmp = {horizontal: true}
    res.width = toXLSMeasure(style.width, tmp)
    if (tmp.isPercent) {
      res.widthPercent = res.width
      res.width = undefined
    }
  }
  if (style.height) {
    tmp = {}
    res.height = toXLSMeasure(style.height, tmp)
    if (tmp.isPercent) {
      res.heightPercent = res.height
      res.height = undefined
    }
  }
  if (style['min-height']) {
    tmp = {}
    res.minHeight = toXLSMeasure(style['min-height'], tmp)
    if (tmp.isPercent) {
      res.minHeightPercent = res.minHeight
      res.minHeight = undefined
    }
  }
  return res
}

function parseComplex (value, onValue) {
  let result = {}
  if (!onValue) {
    onValue = function (v) { return v }
  }
  switch (value.length) {
    case 1:
      result.top = result.left = result.right = result.bottom = onValue(value[0])
      break
    case 2:
      result.top = result.bottom = onValue(value[0])
      result.left = result.right = onValue(value[1])
      break
    case 3:
      result.top = onValue(value[0])
      result.left = result.right = onValue(value[1])
      result.bottom = onValue(value[2])
      break
    case 4:
      result.top = onValue(value[0])
      result.right = onValue(value[1])
      result.bottom = onValue(value[2])
      result.left = onValue(value[3])
      break
  }
  return result
}

function getBorderInfo (itemStyle) {
  let borderStyle, bWidth, borderColor
  let border = {}

  if (itemStyle.border) {
    let brd = itemStyle.border.split(' ')
    if (brd.length > 0) {
      bWidth = [brd[0]]
    }
    if (brd.length > 1) {
      borderStyle = [brd[1]]
    }
    if (brd.length > 2) {
      borderColor = [brd[2]]
    }
  }
  if (!borderStyle) {
    borderStyle = itemStyle['border-style']
    if (borderStyle) {
      borderStyle = (borderStyle || '').split(' ')
    }
  }
  if (!borderColor) {
    borderColor = itemStyle['border-color']
    if (borderColor) {
      borderColor = (borderColor || '').split(' ')
    }
  }
  if (itemStyle['border-right']) {
    border.right = extractBorderProps(itemStyle['border-right'])
  }
  if (itemStyle['border-left']) {
    border.left = extractBorderProps(itemStyle['border-left'])
  }
  if (itemStyle['border-top']) {
    border.top = extractBorderProps(itemStyle['border-top'])
  }
  if (itemStyle['border-bottom']) {
    border.bottom = extractBorderProps(itemStyle['border-bottom'])
  }

  borderColor = parseComplex(borderColor || [])
  if (itemStyle['border-top-color']) {
    borderColor.top = itemStyle['border-top-color']
  }
  if (itemStyle['border-right-color']) {
    borderColor.right = itemStyle['border-right-color']
  }
  if (itemStyle['border-bottom-color']) {
    borderColor.bottom = itemStyle['border-bottom-color']
  }
  if (itemStyle['border-left-color']) {
    borderColor.left = itemStyle['border-left-color']
  }

  borderStyle = parseComplex(borderStyle || [])
  if (itemStyle['border-top-style']) {
    borderStyle.top = itemStyle['border-top-style']
  }
  if (itemStyle['border-right-style']) {
    borderStyle.right = itemStyle['border-right-style']
  }
  if (itemStyle['border-bottom-style']) {
    borderStyle.bottom = itemStyle['border-bottom-style']
  }
  if (itemStyle['border-left-style']) {
    borderStyle.left = itemStyle['border-left-style']
  }

  if (!bWidth) {
    bWidth = itemStyle['border-width']
    if (bWidth) {
      bWidth = (bWidth || '').split(' ')
    }
  }
  let rWidth = parseComplex(bWidth || [])
  if (itemStyle['border-top-width']) {
    rWidth.top = itemStyle['border-top-width']
  }
  if (itemStyle['border-right-width']) {
    rWidth.right = itemStyle['border-right-width']
  }
  if (itemStyle['border-bottom-width']) {
    rWidth.bottom = itemStyle['border-bottom-width']
  }
  if (itemStyle['border-left-width']) {
    rWidth.left = itemStyle['border-left-width']
  }
  if (rWidth.top) {
    rWidth.top = convertToMeasure(parseIntValue(rWidth.top), 'px')
  }
  if (rWidth.right) {
    rWidth.right = convertToMeasure(parseIntValue(rWidth.right), 'px')
  }
  if (rWidth.bottom) {
    rWidth.bottom = convertToMeasure(parseIntValue(rWidth.bottom), 'px')
  }
  if (rWidth.left) {
    rWidth.left = convertToMeasure(parseIntValue(rWidth.left), 'px')
  }

  setPropertyStyleFromType(border, 'right', rWidth, 'width')
  setPropertyStyleFromType(border, 'left', rWidth, 'width')
  setPropertyStyleFromType(border, 'bottom', rWidth, 'width')
  setPropertyStyleFromType(border, 'top', rWidth, 'width')

  setPropertyStyleFromType(border, 'right', borderStyle, 'style')
  setPropertyStyleFromType(border, 'left', borderStyle, 'style')
  setPropertyStyleFromType(border, 'bottom', borderStyle, 'style')
  setPropertyStyleFromType(border, 'top', borderStyle, 'style')

  setPropertyStyleFromType(border, 'right', borderColor, 'color')
  setPropertyStyleFromType(border, 'left', borderColor, 'color')
  setPropertyStyleFromType(border, 'bottom', borderColor, 'color')
  setPropertyStyleFromType(border, 'top', borderColor, 'color')

  let result = { borderWidth: rWidth, borderStyle: borderStyle, borderColor: borderColor }
  if (result.borderWidth.top && result.borderStyle.top) {
    result.top = {width: result.borderWidth.top, style: result.borderStyle.top, color: result.borderColor.top}
  }
  if (result.borderWidth.bottom && result.borderStyle.bottom) {
    result.bottom = {width: result.borderWidth.bottom, style: result.borderStyle.bottom, color: result.borderColor.bottom}
  }
  if (result.borderWidth.left && result.borderStyle.left) {
    result.left = {width: result.borderWidth.left, style: result.borderStyle.left, color: result.borderColor.left}
  }
  if (result.borderWidth.right && result.borderStyle.right) {
    result.right = {width: result.borderWidth.right, style: result.borderStyle.right, color: result.borderColor.right}
  }
  return result
}

function setPropertyStyleFromType (objType, type, obj, style) {
  if (objType[type] && objType[type][style] && (!obj[type] || !obj[type][style])) {
   // obj[type] = obj[type] || {}
    obj[type] = objType[type][style]
  }
}

const borderStyles = ['none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset']

/**
 * parse html border style '1px solid black' and return object {style, width, color}
 * @param items
 * @return {*}
 */
function extractBorderProps (items) {
  items = (items || '').split(' ')
  if (items.length < 2) return false
  const result = {}
  if (borderStyles.indexOf(items[1] >= 0)) {
    result.style = items[1]
    result.width = convertToMeasure(parseIntValue(items[0]))
  } else {
    result.style = items[0]
    result.width = convertToMeasure(parseIntValue(items[1]))
  }
  if (items.length > 2) {
    result.color = items[2]
  }
  return result
}

function getPaddingInfo (itemStyle, def) {
  let fdef = def || {}
  let rWidth = { top: fdef.top, left: fdef.left, right: fdef.right, bottom: fdef.bottom }
  let bWidth = itemStyle.padding

  if (bWidth) {
    bWidth = (bWidth || '').split(' ')
    rWidth = parseComplex(bWidth || [])
  }
  if (itemStyle['padding-top']) {
    rWidth.top = itemStyle['padding-top']
  }
  if (itemStyle['padding-right']) {
    rWidth.right = itemStyle['padding-right']
  }
  if (itemStyle['padding-bottom']) {
    rWidth.bottom = itemStyle['padding-bottom']
  }
  if (itemStyle['padding-left']) {
    rWidth.left = itemStyle['padding-left']
  }
  if (rWidth.top) {
    rWidth.top = convertToMeasure(parseIntValue(rWidth.top), 'px')
  }
  if (rWidth.right) {
    rWidth.right = convertToMeasure(parseIntValue(rWidth.right), 'px')
  }
  if (rWidth.bottom) {
    rWidth.bottom = convertToMeasure(parseIntValue(rWidth.bottom), 'px')
  }
  if (rWidth.left) {
    rWidth.left = convertToMeasure(parseIntValue(rWidth.left), 'px')
  }
  return rWidth
}

function getMarginInfo (itemStyle, def) {
  let fDef = def || {}
  let rWidth = { top: fDef.top || 0, left: fDef.left || 0, right: fDef.right || 0, bottom: fDef.bottom || 0 }
  let bWidth = itemStyle.margin

  if (bWidth) {
    bWidth = (bWidth || '').split(' ')
    rWidth = parseComplex(bWidth || [])
  }
  if (itemStyle['margin-top']) {
    rWidth.top = itemStyle['margin-top']
  }
  if (itemStyle['margin-right']) {
    rWidth.right = itemStyle['margin-right']
  }
  if (itemStyle['margin-bottom']) {
    rWidth.bottom = itemStyle['margin-bottom']
  }
  if (itemStyle['margin-left']) {
    rWidth.left = itemStyle['margin-left']
  }
  if (rWidth.top) {
    rWidth.top = convertToMeasure(parseIntValue(rWidth.top), 'px')
  }
  if (rWidth.right) {
    rWidth.right = convertToMeasure(parseIntValue(rWidth.right), 'px')
  }
  if (rWidth.bottom) {
    rWidth.bottom = convertToMeasure(parseIntValue(rWidth.bottom), 'px')
  }
  if (rWidth.left) {
    rWidth.left = convertToMeasure(parseIntValue(rWidth.left), 'px')
  }
  return rWidth
}

function getAttribute (node, name, defaultValue) {
  if (!node.attributes) {
    return defaultValue
  }
  let val = node.attributes.getNamedItem(name)
  if (val) {
    return val.value || defaultValue
  }
  return defaultValue
}

function getAttributeInt (node, name) {
  return parseInt(getAttribute(node, name, 0), 10)
}

/**
 * Set attribute value. If attribute not exist create it.
 * @param {xmldom.Node} node
 * @param {String} name
 * @param {Int} value
 */
function updateAttributeInt (node, name, value) {
  if (!node.attributes) return

  let val = node.attributes.getNamedItem(name)
  if (val) {
    val.value = value
  } else {
    val = node.ownerDocument.createAttribute(name)
    val.value = value
    node.attributes.setNamedItem(val)
  }
}

const htmlBaseEntity = {'&lt;': 1, '&gt;': 1, '&amp;': 1, '&apos;': 1, '&quot;': 1}
// all HTML4 entities as defined here: http://www.w3.org/TR/html4/sgml/entities.html
// added: amp, lt, gt, quot and apos
const htmlEntityTable = {'quot': 34, 'amp': 38, 'apos': 39, 'lt': 60, 'gt': 62, 'nbsp': 160, 'iexcl': 161, 'cent': 162, 'pound': 163, 'curren': 164, 'yen': 165, 'brvbar': 166, 'sect': 167, 'uml': 168, 'copy': 169, 'ordf': 170, 'laquo': 171, 'not': 172, 'shy': 173, 'reg': 174, 'macr': 175, 'deg': 176, 'plusmn': 177, 'sup2': 178, 'sup3': 179, 'acute': 180, 'micro': 181, 'para': 182, 'middot': 183, 'cedil': 184, 'sup1': 185, 'ordm': 186, 'raquo': 187, 'frac14': 188, 'frac12': 189, 'frac34': 190, 'iquest': 191, 'Agrave': 192, 'Aacute': 193, 'Acirc': 194, 'Atilde': 195, 'Auml': 196, 'Aring': 197, 'AElig': 198, 'Ccedil': 199, 'Egrave': 200, 'Eacute': 201, 'Ecirc': 202, 'Euml': 203, 'Igrave': 204, 'Iacute': 205, 'Icirc': 206, 'Iuml': 207, 'ETH': 208, 'Ntilde': 209, 'Ograve': 210, 'Oacute': 211, 'Ocirc': 212, 'Otilde': 213, 'Ouml': 214, 'times': 215, 'Oslash': 216, 'Ugrave': 217, 'Uacute': 218, 'Ucirc': 219, 'Uuml': 220, 'Yacute': 221, 'THORN': 222, 'szlig': 223, 'agrave': 224, 'aacute': 225, 'acirc': 226, 'atilde': 227, 'auml': 228, 'aring': 229, 'aelig': 230, 'ccedil': 231, 'egrave': 232, 'eacute': 233, 'ecirc': 234, 'euml': 235, 'igrave': 236, 'iacute': 237, 'icirc': 238, 'iuml': 239, 'eth': 240, 'ntilde': 241, 'ograve': 242, 'oacute': 243, 'ocirc': 244, 'otilde': 245, 'ouml': 246, 'divide': 247, 'oslash': 248, 'ugrave': 249, 'uacute': 250, 'ucirc': 251, 'uuml': 252, 'yacute': 253, 'thorn': 254, 'yuml': 255, 'OElig': 338, 'oelig': 339, 'Scaron': 352, 'scaron': 353, 'Yuml': 376, 'fnof': 402, 'circ': 710, 'tilde': 732, 'Alpha': 913, 'Beta': 914, 'Gamma': 915, 'Delta': 916, 'Epsilon': 917, 'Zeta': 918, 'Eta': 919, 'Theta': 920, 'Iota': 921, 'Kappa': 922, 'Lambda': 923, 'Mu': 924, 'Nu': 925, 'Xi': 926, 'Omicron': 927, 'Pi': 928, 'Rho': 929, 'Sigma': 931, 'Tau': 932, 'Upsilon': 933, 'Phi': 934, 'Chi': 935, 'Psi': 936, 'Omega': 937, 'alpha': 945, 'beta': 946, 'gamma': 947, 'delta': 948, 'epsilon': 949, 'zeta': 950, 'eta': 951, 'theta': 952, 'iota': 953, 'kappa': 954, 'lambda': 955, 'mu': 956, 'nu': 957, 'xi': 958, 'omicron': 959, 'pi': 960, 'rho': 961, 'sigmaf': 962, 'sigma': 963, 'tau': 964, 'upsilon': 965, 'phi': 966, 'chi': 967, 'psi': 968, 'omega': 969, 'thetasym': 977, 'upsih': 978, 'piv': 982, 'ensp': 8194, 'emsp': 8195, 'thinsp': 8201, 'zwnj': 8204, 'zwj': 8205, 'lrm': 8206, 'rlm': 8207, 'ndash': 8211, 'mdash': 8212, 'lsquo': 8216, 'rsquo': 8217, 'sbquo': 8218, 'ldquo': 8220, 'rdquo': 8221, 'bdquo': 8222, 'dagger': 8224, 'Dagger': 8225, 'bull': 8226, 'hellip': 8230, 'permil': 8240, 'prime': 8242, 'Prime': 8243, 'lsaquo': 8249, 'rsaquo': 8250, 'oline': 8254, 'frasl': 8260, 'euro': 8364, 'image': 8465, 'weierp': 8472, 'real': 8476, 'trade': 8482, 'alefsym': 8501, 'larr': 8592, 'uarr': 8593, 'rarr': 8594, 'darr': 8595, 'harr': 8596, 'crarr': 8629, 'lArr': 8656, 'uArr': 8657, 'rArr': 8658, 'dArr': 8659, 'hArr': 8660, 'forall': 8704, 'part': 8706, 'exist': 8707, 'empty': 8709, 'nabla': 8711, 'isin': 8712, 'notin': 8713, 'ni': 8715, 'prod': 8719, 'sum': 8721, 'minus': 8722, 'lowast': 8727, 'radic': 8730, 'prop': 8733, 'infin': 8734, 'ang': 8736, 'and': 8743, 'or': 8744, 'cap': 8745, 'cup': 8746, 'int': 8747, 'there4': 8756, 'sim': 8764, 'cong': 8773, 'asymp': 8776, 'ne': 8800, 'equiv': 8801, 'le': 8804, 'ge': 8805, 'sub': 8834, 'sup': 8835, 'nsub': 8836, 'sube': 8838, 'supe': 8839, 'oplus': 8853, 'otimes': 8855, 'perp': 8869, 'sdot': 8901, 'lceil': 8968, 'rceil': 8969, 'lfloor': 8970, 'rfloor': 8971, 'lang': 9001, 'rang': 9002, 'loz': 9674, 'spades': 9824, 'clubs': 9827, 'hearts': 9829, 'diams': 9830}

/**
 * Remove all not xml Entities
 * @param htmlText
 * @returns {*}
 */
function removeEntities (htmlText) {
  if (!htmlText) {
    return htmlText
  }

  return htmlText.replace(/&([A-Za-z0-9]{2,20})?;/g, function (c) {
    if (htmlBaseEntity[c]) {
      return c
    }
    let e = htmlEntityTable[c.substr(1, c.length - 2)]
    return e ? String.fromCharCode(e) : ' '
  })
}

function parseIntValue (value) {
  switch (typeof (value)) {
    case 'string':
      return parseInt(value, 10)
    case 'number':
      return value
    default: return 0
  }
}

module.exports = XLSXfromHTML
