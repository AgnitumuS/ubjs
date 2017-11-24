const XLSXStyleBorder = require('./XLSXStyleBorder')
const XLSXStyleFill = require('./XLSXStyleFill')
const XLSXStyleFormat = require('./XLSXStyleFormat')
const XLSXStyleFont = require('./XLSXStyleFont')
const XLSXStyleAlign = require('./XLSXStyleAlign')
const XLSXStyleProtect = require('./XLSXStyleProtect')

/**
 *
 *   const wb = new XLSXWorkbook()
 *   wb.useSharedString = false
 *   var defFont = wb.style.fonts.add({code: 'def', name: 'Calibri', fontSize: 11, scheme: 'minor'})
 *    var borderFull = wb.style.borders.add({
 *       left: {style: 'thin'},
 *       right: {style: 'thin'},
 *       top: {style: 'thin'},
 *       bottom: {style: 'thin'}
 *    })
 *
 *    let fillBG = wb.style.fills.add({fgColor: {rgb: 'CFE39D'}})
 *    var fstyle = wb.style.getStyle({font: defFont})
 *    var fstyleWithFill = wb.style.getStyle({font: defFont, fill: fillBG})
 *
 * @class XLSXStyle
 */
class XLSXStyle {
  static get indexDefFormateDate () {
    return 14
  }
  static get predefinedFormats () {
    return {
      general: 0,
      sum: 2,
      number: 3,
      sumDelim: 4,
      percent: 9,
      percentDec: 10,
      date: 14,
      dateFull: 15,
      dateShort: 17,
      dateMY: 17,
      timeShortPM: 18,
      timeFullPM: 19,
      time: 20,
      timeFull: 21,
      dateTime: 22,
      numF: 37,
      numRedF: 38,
      sumF: 39,
      sumRedF: 40,
      mail: 49
    }
  }

  constructor (config) {
    config = config || {}

    this.borders = new XLSXStyleBorder({left: {}, right: {}, top: {}, bottom: {}})
    this.fills = new XLSXStyleFill({patternType: 'none'})
    this.formats = new XLSXStyleFormat()
    this.fonts = new XLSXStyleFont()
    this.alignments = new XLSXStyleAlign()
    this.protects = new XLSXStyleProtect()

    this.elements = []
    this.named = {}
    this.compiled = []
    this.styleHashList = {}
    this.styleHashListIndex = 0

    this.defaultStyle = this.getStyle({code: 'defaultStyle'})
  }

  compileSTemplate (cfg) {
    let out = []
    out.push(`<xf numFmtId="${cfg.format}" fontId="${cfg.font}" fillId="${cfg.fill}" borderId="${cfg.border}" xfId="0"`)
    if (cfg.setformat === true) {
      out.push(' applyNumberFormat="1"')
    }
    // if (cfg.setfont === true){
    out.push(' applyFont="1"')
    // }
    if (cfg.setfill === true) {
      out.push(' applyFill="1"')
    }
    if (cfg.setborder === true) {
      out.push(' applyBorder="1"')
    }
    if (cfg.setalignment === true || cfg.setWrapText === 1) {
      out.push(' applyAlignment="1"')
    }
    if (cfg.setprotect === true) {
      out.push(' applyProtection="1"')
    }
    out.push('>')
    if (cfg.setalignment === true) {
      out.push(' ', cfg.alignmentval)
    }
    if (cfg.setprotect === true) {
      out.push(' ', cfg.protectionval)
    }

    let setAdditionalAlignment =
      cfg.setWrapText ||
      cfg.setVerticalAlign ||
      cfg.setHorizontalAlign

    if (setAdditionalAlignment !== 0) {
      out.push('<alignment ')
    }
    if (cfg.setWrapText === 1) {
      out.push(' wrapText="1" ')
    }
    // top, center, bottom (by default)
    if (cfg.setVerticalAlign !== 0) {
      out.push(' vertical="' + cfg.setVerticalAlign + '" ')
    }
    // left (by default), center, right
    if (cfg.setHorizontalAlign !== 0) {
      out.push(' horizontal="' + cfg.setHorizontalAlign + '" ')
    }
    if (setAdditionalAlignment !== 0) {
      out.push('/>')
    }

    out.push('</xf>')
    return out.join('')
  }

  compileTemplate (obj) {
    let out = []

    out.push(
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n',
      '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
    )
    if (obj.formatsCnt > 0) {
      out.push('<numFmts count="', obj.formats.elements.length, '">', obj.formats.render(), '</numFmts>')
    }
    if (obj.fontsCnt > 0) {
      out.push('<fonts count="', obj.fonts.elements.length, '">', obj.fonts.render(), '</fonts>')
    }
    if (obj.fillsCnt > 0) {
      out.push('<fills count="', obj.fills.elements.length, '">', obj.fills.render(), '</fills>')
    }
    if (obj.bordersCnt > 0) {
      out.push('<borders count="', obj.borders.elements.length, '">', obj.borders.render(), '</borders>')
    }
    out.push(
      '<cellStyleXfs count="1">',
      '<xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>',
      '</cellStyleXfs>',
      '<cellXfs count="', obj.compiled.length, '">', obj.elementsJoined, '</cellXfs>',
      '<cellStyles count="1">',
      '<cellStyle name="Обычный" xfId="0" builtinId="0"/>',
      '</cellStyles>',
      '<dxfs count="0"/>',
      '<tableStyles count="0" defaultTableStyle="TableStyleMedium9" defaultPivotStyle="PivotStyleLight16"/>',
      '</styleSheet>'
    )

    return out.join('')
    // '<extLst><ext uri="" xmlns:x14="http://schemas.microsoft.com/office/spreadsheetml/2009/9/main">',
    //    '<x14:slicerStyles defaultSlicerStyle="SlicerStyleLight1"/></ext></extLst>',
  }

  /**
   * If style not exists add new.  Return style index
   * @param config
   *  @param {Number} [config.border] (optional) {@link XLSX.csStyle#borders.add} {@link XLSX.csStyleBorder#add}
   *  @param {Number} [config.fill] (optional) {@link XLSX.csStyle#fills.add} {@link XLSX.csStyleFill#add}
   *  @param {Number} [config.format] (optional) {@link XLSX.csStyle#formats.add} {@link XLSX.csStyleFormat#add}
   *  @param {Number} [config.font] (optional) {@link XLSX.csStyle#fonts.add} {@link XLSX.csStyleFont#add}
   *  @param {Number} [config.alignment] (optional) {@link XLSX.csStyle#alignments.add} {@link XLSX.csStyleAlign#add}
   *  @param {Number} [config.protect] (optional) {@link XLSX.csStyle#protects.add} {@link XLSX.csStyleProtect#add}
   *  @return {Number}
   */
  getStyle (config) {
    const cfg = config
    cfg.setborder = typeof cfg.border !== 'undefined'
    cfg.border = cfg.border || 0
    cfg.setfill = typeof cfg.fill !== 'undefined'
    cfg.fill = cfg.fill || 0
    cfg.setformat = typeof cfg.format !== 'undefined'
    cfg.format = cfg.format || 0
    cfg.setfont = typeof cfg.font !== 'undefined'
    cfg.font = cfg.font || 0
    cfg.setalignment = typeof cfg.alignment !== 'undefined'
    cfg.setWrapText = cfg.setWrapText || 0
    cfg.setVerticalAlign = cfg.setVerticalAlign || 0
    cfg.setHorizontalAlign = cfg.setHorizontalAlign || 0
    cfg.alignment = cfg.alignment || 0
    if (typeof cfg.alignment !== 'undefined') {
      cfg.alignmentval = this.alignments.compiled[cfg.alignment]
    }
    cfg.setprotect = typeof cfg.protect !== 'undefined'
    if (typeof cfg.protect !== 'undefined') {
      cfg.protectval = this.protects.compiled[cfg.protect]
    }
    cfg.protect = cfg.protect || 0
    const styleHash = this.getStyleHash(cfg)
    let styleId = this.styleHashList[styleHash]
    if (styleId) {
      return styleId
    }

    cfg.id = this.styleHashList[styleHash] = this.styleHashListIndex // this.elements
    this.styleHashListIndex++
    this.compiled.push(this.compileSTemplate(cfg)) // this.tplXfs.apply(cfg)
    if (cfg.code) {
      this.named[cfg.code] = cfg.id
    }
    return cfg.id
  }

  getDefDateStyle () {
    if (!this.named.DefDateStyle) {
      this.getStyle({format: XLSXStyle.indexDefFormateDate, code: 'DefDateStyle'})
    }
    return this.named.DefDateStyle
  }

  /**
   * @private
   * @param config
   * @return {String}
   */
  getStyleHash (config) {
    return [
      !config.setborder ? '#' : config.border.toString(),
      !config.border ? '#' : config.border.toString(),
      !config.setfill ? '#' : config.fill.toString(),
      !config.setformat ? '#' : config.format.toString(),
      !config.setfont ? '#' : config.font.toString(),
      !config.setalignment ? '#' : config.alignment.toString(),
      !config.setprotect ? '#' : config.protect.toString(),
      !config.setWrapText ? '#' : config.setWrapText.toString(),
      !config.setVerticalAlign ? '#' : config.setVerticalAlign.toString(),
      !config.setHorizontalAlign ? '#' : config.setHorizontalAlign.toString()
    ].join('_')
  }

  /**
   * @private
   * @return {String}
   */
  render () {
    this.elementsJoined = this.compiled.join('')
    this.bordersCnt = this.borders.elements.length
    this.fillsCnt = this.fills.elements.length
    this.formatsCnt = this.formats.elements.length
    this.fontsCnt = this.fonts.elements.length
    this.alignmentsCnt = this.alignments.elements.length
    this.protectsCnt = this.protects

    return this.compileTemplate(this) // this.tpl.apply(this);
  }
}

module.exports = XLSXStyle
