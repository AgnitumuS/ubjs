const fontsMap = {}

class XLSXfromHTML {
  constructor (DOMParser, workBook, sheetConfig) {
    this.parser = new DOMParser()
    this.wb = workBook
    this.sheetConfig = sheetConfig
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
    findNode(node, 'tr', rows, true)
    rows.forEach(F => {
      this.writeRow(ws, F, rowIndex, ctxt)
      rowIndex++
    })
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
    let minHeight = trInfo.style.height || trInfo.style.minHeight

    findNode(node, 'td', cells)
    let sellsData = cells.map(F => {
      let cellInfo = {}
      cellInfo.value = getCellValue(F)
      let tdInfo = getTagInfo(node)
      let tdMinHeight = tdInfo.style.height || tdInfo.style.minHeight
      if (tdMinHeight && tdMinHeight > minHeight) minHeight = tdMinHeight
      cellInfo.
      return cellInfo
    })
    ws.addRow(sellsData)
  }
}

/**
 *
 * @param node
 * @return {string}
 */
function getCellValue (node) {
  var result = ''
  if (!node.childNodes) return result
  node.childNodes.forEach(function (childNode) {
    result += getCellValue(childNode)
    if (!childNode.nodeValue) {
      result += childNode.nodeValue
    }
  })
  return result
}

function findNode (node, key, items, deep) {
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

function convertToMeasure (value, measure) {
  if (!value) return value
  switch (measure) {
    case 'px':
    case 'pt':
      return value * 25.4 / 72
    case 'cm':
    case 'mm':
      return value
    default:
      throw new Error('Unknown measure ' + measure)
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
  return this.convertToMeasure(val, 'px')
}

function getTagInfo (node) {
  let info = {}
  info.styleProps = parseStyle(node)
  info.style = getStyleProp(info.styleProps)
  info.border = getBorderInfo(info.styleProps)
  info.padding = getPaddingInfo(info.styleProps)
  info.margin = getMarginInfo(info.styleProps)
  return info
}

function getStyleByHtml (wb, htmlStyleInfo) {
  if (htmlStyleInfo.backgroundColor)
    wb.style.fill.add({fgColor: {rgb: 'fff100'}})
}


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
        res.font.type = 'bold'
      }
    }
  }
  if (style['font-style']) {
    tmp = style['font-style']
    if (tmp) {
      res.font.style = tmp
      if (tmp !== 'normal') {
        res.font.type = (res.font.type || '') + 'italic'
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
  // cfg.color || pBlock.font.color);
  if (style['text-align']) {
    tmp = style['text-align']
    if (tmp) {
      res.align = tmp
    }
  }
  if (style['vertical-align']) {
    tmp = style['vertical-align']
    tmp = tmp === 'middle' ? 'center' : tmp
    res.verticalAlign = tmp
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
    tmp = {}
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
  let borderStyle, bWidth

  if (itemStyle.border) {
    let brd = itemStyle.border.split(' ')
    if (brd.length > 0) {
      bWidth = [brd[0]]
    }
    if (brd.length > 1) {
      borderStyle = [brd[1]]
    }
  }
  if (!borderStyle) {
    borderStyle = itemStyle['border-style']
    if (borderStyle) {
      borderStyle = (borderStyle || '').split(' ')
    }
  }
  borderStyle = this.parseComplex(borderStyle || [])
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
  return { borderWidth: rWidth, borderStyle: borderStyle }
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
