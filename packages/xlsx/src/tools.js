/**
 * Created by xmax on 16.11.2017.
 */
module.exports = {
  numFmts: ['General', '0', '0.00', '#,##0', '#,##0.00', null, null, null, null, '0%', '0.00%', '0.00E+00', '# ?/?', '# ??/??',
    'mm-dd-yy', 'd-mmm-yy', 'd-mmm', 'mmm-yy', 'h:mm AM/PM', 'h:mm:ss AM/PM',
    'h:mm', 'h:mm:ss', 'm/d/yy h:mm', null, null, null, null, null, null, null, null, null, null, null, null, null, null, '#,##0 ;(#,##0)',
    '#,##0 ;[Red](#,##0)', '#,##0.00;(#,##0.00)', '#,##0.00;[Red](#,##0.00)', null, null, null, null,
    'mm:ss', '[h]:mm:ss', 'mmss.0', '##0.0E+0', '@'],

  alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numAlpha: function (i) {
    let t = Math.floor(i / 26) - 1
    return (t > -1 ? this.numAlpha(t) : '') + this.alphabet.charAt(i % 26)
  },
  alphaNum: function (s) {
    let t = 0
    if (s.length === 2) {
      t = this.alphaNum(s.charAt(0)) + 1
    }
    return t * 26 + this.alphabet.indexOf(s.substr(-1))
  },
  convertDate: function (input) {
    if (typeof input === 'object') {
      return ((input - (Date.UTC(1900, 0, 0) + input.getTimezoneOffset() * 60000)) / 86400000) + 1
    } else {
      return new Date(+(Date.UTC(1900, 0, 0) + input.getTimezoneOffset() * 60000) + (input - 1) * 86400000)
    }
  },
  typeOf: function (obj) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
  },
  getAttr: function (s, n) {
    s = s.substr(s.indexOf(n + '="') + n.length + 2)
    return s.substring(0, s.indexOf('"'))
  },
  escapeXML: function (s) {
    return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;')
  }, // see http://www.w3.org/TR/xml/#syntax
  unescapeXML: function (s) {
    return (s || '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;/g, '\'')
  },
  /**
   *
   * @param {Array} items
   * @param {String} [delimiter='_']
   */
  createHash: function (items, delimiter) {
    items.map(v => v || '').join(delimiter || '_')
  },
  getHashColor (info) {
    return this.createHash([info.theme, info.tint, info.indexed, info.rgb])
  }
}
