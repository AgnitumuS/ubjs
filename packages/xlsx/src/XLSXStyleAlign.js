/**
 * Created by xmax on 16.11.2017.
 */
const XLSXBaseStyleElement = require('./XLSXBaseStyleElement')
const tools = require('./tools')

/**
 * @class XLSXStyleAlign Registered alignment styles
 */
class XLSXStyleAlign extends XLSXBaseStyleElement {
  templateCompile (element) {
    let prop
    let out = []
    out.push('<alignment ')
    for (prop in element) {
      if (element.hasOwnProperty(prop)) {
        if (prop === 'id' || prop === 'code' || prop === 'code') {
          continue
        }
        out.push(prop, '="', element[prop], '" ')
      }
    }
    out.push('/>')
    return out.join('')
  }

  getHash (info) {
    return tools.createHash([
      info.horizontal,
      info.vertical,
      info.textRotation,
      info.wrapText,
      info.indent,
      info.relativeIndent,
      info.justifyLastLine,
      info.shrinkToFit,
      info.readingOrder
    ])
  }

  /**
   * Add new alignment style info. Used for add new style.
   * @param {Object} info
   * @param {String} [info.horizontal] = (general | left | center | right | fill | justify | centerContinuous | distributed)
   * @param {String} [info.vertical] = (top | center | bottom | justify distributed)
   * @param {Number} [info.textRotation]
   * @param {Boolean} [info.wrapText]
   * @param {Number} [info.indent]
   * @param {Number} [info.relativeIndent]
   * @param {Boolean} [info.justifyLastLine]
   * @param {Boolean} [info.shrinkToFit]
   * @param {Number} [info.readingOrder]
   * @return {Number} index
   */
  add (info) {
    return super.add(info)
  }

  compile (element) {
    this.compiled.push(this.templateCompile(element)) // tpl.apply(element)
  }
}

module.exports = XLSXStyleAlign
