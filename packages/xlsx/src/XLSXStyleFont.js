/**
 * Created by xmax on 16.11.2017.
 */
const XLSXBaseStyleElement = require('./XLSXBaseStyleElement')
const tools = require('./tools')

/**
 * @class XLSXStyleFont Registered font styles
 */
class XLSXStyleFont extends XLSXBaseStyleElement {
  compileTemplate (element) {
    let out = []
    let xkey
    out.push('<font>')
    if (element.bold === true) {
      out.push('<b/>')
    }
    if (element.shadow === true) {
      out.push('<shadow/>')
    }
    if (element.fontSize) {
      out.push('<sz val="', element.fontSize + '', '"/>')
    }
    if (element.color) {
      out.push('<color ')
      for (xkey in element.color) {
        if (element.color.hasOwnProperty(xkey)) {
          out.push(xkey, '="', element.color[xkey], '" ')
        }
      }
      out.push('/>')
    }
    if (element.name) {
      out.push('<name val="', element.name, '"/>')
    }
    if (element.family) {
      out.push('<family val="', element.family, '"/>')
    }
    if (element.scheme) {
      out.push('<scheme val="', element.scheme, '"/>')
    }
    if (element.underline) {
      out.push('<underline val="', element.underline, '"/>')
    }
    out.push('</font>')
    return out.join('')
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

  /**
   * add new fill style info. Used for add new style.
   * @param {Object} info
   * @param {String} [info.name] (optional) Calibri
   * @param {String} [info.charset] (optional)
   * @param {Number} [info.fontSize] (optional)
   * @param {Boolean} [info.bold] (optional)
   * @param {Boolean} [info.shadow] (optional)
   * @param {Number} [info.family] (optional) 0 - 14
   * @param {String} [info.scheme] (optional)  none, major, minor
   * @param {String} [info.underline] (optional) single, double, singleAccounting, doubleAccounting, none,
   * @param {Object} [info.color] (optional)
   * @param {String} [info.color.theme] (optional)
   * @param {Number} [info.color.tint] (optional)
   * @param {Number} [info.color.indexed] (optional)
   * @param {String} [info.color.rgb] (optional)
   * @return {Number} index
   */
  add (info) {
    return super.add(info)
  }
}

module.exports = XLSXStyleFont
