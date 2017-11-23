/**
 * Created by xmax on 16.11.2017.
 */
const XLSXBaseStyleElement = require('./XLSXBaseStyleElement')
const tools = require('./tools')

/**
 * @class XLSXStyleProtect Registered protect styles
 */
class XLSXStyleProtect extends XLSXBaseStyleElement {
  compileTemplate (element) {
    let out = []
    let xkey
    out.push('<protection>')
    for (xkey in element) {
      if (element.color.hasOwnProperty(xkey)) {
        if (xkey === 'id' || xkey === 'code' || xkey === 'code') {
          continue
        }
        out.push(' ', xkey, '="', element[xkey], '" ')
      }
    }
    out.push('/>')
    return out.join('')
  }

  /**
   * add new locked style info. Used for add new style.
   *
   * @param {Object} info
   * @param {String} info.type locked, hidden
   * @param {boolean} info.value
   * @return {Number} index
   */
  add (info) {
    return super.add(info)
  }

  getHash (info) {
    return tools.createHash([
      info.patternType,
      info.charset,
      info.fontSize,
      info.bold,
      info.shadow,
      info.family,
      info.scheme,
      info.underline,
      info.color ? tools.getHashColor(info.color) : '#'
    ])
  }

  compile (element) {
    this.compiled.push(this.compileTemplate(element)) // tpl.apply(element)
  }
}

module.exports = XLSXStyleProtect
