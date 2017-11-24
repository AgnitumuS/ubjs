/**
 * Created by xmax on 16.11.2017.
 */
const XLSXBaseStyleElement = require('./XLSXBaseStyleElement')
const tools = require('./tools')

/**
 * @class XLSXStyleFill Registered fill styles
 *  example
 *
 *    const wb = new XLSXWorkbook()
 *    let fillBG = wb.style.fills.add({fgColor: {rgb: 'fff100'}})
 *    let fillBG1 = wb.style.fills.add({fgColor: {rgb: 'fff100'}})
 */
class XLSXStyleFill extends XLSXBaseStyleElement {
  compileTemplate (element) {
    let out = []
    out.push(
      '<fill>',
      `<patternFill patternType="${element.patternType || 'solid'}">`
    )
    if (element.fgColor) {
      out.push('<fgColor ')
      if (element.fgColor.theme) {
        out.push('theme="', element.fgColor.theme + '', '" ')
      }
      if (element.fgColor.tint) {
        out.push('tint="', element.fgColor.tint + '', '" ')
      }
      if (element.fgColor.indexed) {
        out.push('indexed="', element.fgColor.indexed + '', '" ')
      }
      if (element.fgColor.rgb) { // rgb: '9ED2E0'
        out.push('rgb="', element.fgColor.rgb + '', '" ')
      }
      out.push('/>')
    }
    if (element.bgColor) {
      out.push('<bgColor ')
      if (element.bgColor.theme) {
        out.push('theme="', element.bgColor.theme + '', '" ')
      }
      if (element.bgColor.tint) {
        out.push('tint="', element.bgColor.tint + '', '" ')
      }
      if (element.bgColor.indexed) {
        out.push('indexed="', element.bgColor.indexed + '', '" ')
      }
      if (element.bgColor.rgb) { // rgb: '9ED2E0'
        out.push('rgb="', element.bgColor.rgb + '', '" ')
      }
      out.push('/>')
    }
    out.push(
      '</patternFill>',
      '</fill>'
    )
    return out.join('')
  }

  getHash (info) {
    return tools.createHash([
      info.patternType,
      info.bgColor ? tools.getHashColor(info.bgColor) : '#',
      info.fgColor ? tools.getHashColor(info.bgColor) : '#'
    ])
  }

  /**
   * add new fill style info. Used for add new style.
   * .!!!!
   *  fgColor - Background color of cell
   *  bgColor - Color of pattern
   * @param {Object} info
   * @param {String} [info.patternType] Type of pattern of cell
   * @param {Object} [info.fgColor] (optional) Background color of cell
   * @param {String} [info.fgColor.theme] (optional)
   * @param {Number} [info.fgColor.tint] (optional)
   * @param {Number} [info.fgColor.indexed] (optional)
   * @param {Number} [info.fgColor.rgb] (optional)
   * @param {Object} [info.bgColor] (optional) Color of pattern
   * @param {String} [info.bgColor.theme] (optional)
   * @param {Number} [info.bgColor.tint] (optional)
   * @param {Number} [info.bgColor.indexed] (optional)
   * @param {Number} [info.bgColor.rgb] (optional)
   * @return {Number} index
   */
  add (info) {
    return super.add(info)
  }
}

module.exports = XLSXStyleFill
