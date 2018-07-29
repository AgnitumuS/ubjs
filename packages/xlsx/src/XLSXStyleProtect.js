/**
 * Created by xmax on 16.11.2017.
 */
const {XLSXBaseStyleController} = require('./XLSXBaseStyleElement')
const tools = require('./tools')

let _instance = null
/**
 * @class XLSXStyleProtect Registered protect styles
 */
class XLSXStyleControllerProtect extends XLSXBaseStyleController {
  static instance () {
    if (!_instance) _instance = new XLSXStyleControllerProtect()
    return _instance
  }

  compile (item) {
    let out = []
    let xkey
    let element = item.config
    out.push('<protection>')
    for (xkey in element) {
      if (element.color.hasOwnProperty(xkey)) {
        if (xkey === 'id' || xkey === 'code') {
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
   * @return {XLSXBaseStyleElement}
   */
  add (info) {
    tools.checkParamTypeObj(info, 'XLSXStyleControllerProtect.add')
    return super.add(info, 'PROTECT')
  }

  getHash (info) {
    return tools.createHash([
      info.type,
      info.value
    ])
  }
}

module.exports = {
  XLSXStyleControllerProtect
}
