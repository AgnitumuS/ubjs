/**
 * Created by xmax on 16.11.2017.
*/
const XLSXBaseStyleElement = require('./XLSXBaseStyleElement')
const tools = require('./tools')

/**
 *
 *    const wb = new XLSXWorkbook()
 *    const borderAll = wb.style.borders.add({
 *     left: {style: 'thin'},
 *     right: {style: 'thin'},
 *     top: {style: 'thin'},
 *     bottom: {style: 'thin'}
 *   })
 *
 *    const borderAllAlt = wb.style.borders.add({
 *      style: 'thin',
 *      color: 'ffffff'
 *    })
 *
 * @class XLSXStyleBorder Registered border styles
 */
class XLSXStyleBorder extends XLSXBaseStyleElement {
  compileTemplate (element) {
    let out = []
    let xkey
    let prop
    let colorN
    out.push('<border>')
    for (xkey in element) {
      if (element.hasOwnProperty(xkey)) {
        prop = element[xkey]
        if (xkey === 'id') {
          continue
        }
        out.push('<', xkey, ' ')
        if (prop.style) {
          out.push('style="', prop.style, '" ')
        } else {
          out.push('/')
        }
        out.push('>')
        if (prop.style) {
          out.push('<color ')
          if (prop.color) {
            for (colorN in prop.color) {
              if (prop.color.hasOwnProperty(colorN)) {
                out.push(colorN, '="', prop.color[colorN], '" ')
              }
            }
          } else {
            out.push('auto="1" ')
          }
          out.push('/>')
          out.push('</', xkey, '>')
        }
      }
    }
    out.push('</border>')
    return out.join('')
  }

  /**
   * add new border style info. Used for add new style.
   * @param {Object} info
   * @param {Object} [info.left] (optional)
   * @param {String} [info.left.style] (optional) "none","thin","medium","dashed","dotted","thick","double","hair","mediumDashed","dashDot","mediumDashDot","dashDotDot","mediumDashDotDot","slantDashDot"
   * @param {String} [info.left.color] (optional) default=auto {rgb: 'FFFF0000}
   * @param {Object} [info.right] (optional) like left
   * @param {Object} [info.top] (optional) like left
   * @param {Object} [info.bottom] (optional) like left
   * @param {Object} [info.diagonal] (optional) like left
   * @param {String} [info.style] (optional) Default style for all border
   * @param {String} [info.color] (optional) Default color for all border
   * @param {String} [info.code] (optional) for link code to index in associative array
   * @return {Number} index
   */
  add (info) {
    info = info || {}
    info.left = info.left || {}
    info.right = info.right || {}
    info.top = info.top || {}
    info.bottom = info.bottom || {}
    if (info.style) {
      info.left.style = info.left.style || info.style
      info.right.style = info.left.style || info.style
      info.top.style = info.left.style || info.style
      info.bottom.style = info.left.style || info.style
    }
    if (info.color) {
      info.left.color = info.left.color || info.color
      info.right.color = info.left.color || info.color
      info.top.color = info.left.color || info.color
      info.bottom.color = info.left.color || info.color
    }
    info.diagonal = info.diagonal || {}
    return super.add(info)
  }

  getHash (info) {
    return tools.createHash([
      info.left.style,
      info.left.color ? tools.getHashColor(info.left.color) : '#',
      info.right.style,
      info.right.color ? tools.getHashColor(info.right.color) : '#',
      info.top.style,
      info.top.color ? tools.getHashColor(info.top.color) : '#',
      info.bottom.style,
      info.bottom.color ? tools.getHashColor(info.bottom.color) : '#',
      info.diagonal.style,
      info.diagonal.color ? tools.getHashColor(info.diagonal.color) : '#'
    ])
  }

  /**
   * @private
   * compile borders
   * -----------------
   * <border>
   * <left style="medium">
   *    <color rgb="FFFF0000"/>
   * </left>
   * <top/>
   * <right style="thin">
   *   <color auto="1"/>
   * </right>
   * </border>
   */
  /*
 compile: function(){
     this.compiled =  new Array(this.elements.length);

     Ext.each(this.elements, function(fill, index) {
         this.compiled[index] = this.compileTemplate(fill);    //tpl.apply(fill)
     }, this);
 }
 */
}

module.exports = XLSXStyleBorder
