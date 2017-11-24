/**
 * Created by xmax on 16.11.2017.
 */
const XLSXBaseStyleElement = require('./XLSXBaseStyleElement')
const tools = require('./tools')

/**
 * @class XLSXStyleFormat Registered format styles
 */
class XLSXStyleFormat extends XLSXBaseStyleElement {
  constructor (config) {
    super(config)
    this.startId = 164
  }

  /**
   * add new border style info. Used for add new style.
   * @param {Object} info
   * @param {String} info.formatCode example  #,##0.00_ ;[Red]\-#,##0.00\
   * @return {Number} index
   */
  add (info) {
    info.formatCode = tools.escapeXML(info.formatCode)
    return super.add(info)
  }

  getHash (info) {
    return tools.createHash([
      info.id,
      info.formatCode
    ])
  }

  compile (element) {
    if (element.formatCode) {
      this.compiled.push(`<numFmt numFmtId="${element.id}" formatCode="${element.formatCode}"/>`)
    } else {
      this.compiled.push('')
    }
  }
}

module.exports = XLSXStyleFormat
