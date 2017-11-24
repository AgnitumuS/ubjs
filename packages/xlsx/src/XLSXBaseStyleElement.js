/**
 * Created by xmax on 16.11.2017.
 */
class XLSXBaseStyleElement {
  constructor (config) {
    this.elements = []
    /**
     * Associative array of element. (String code - Integer index) pair
     * @type {Object}
     */
    this.named = {}
    this.compiled = []
    this.startId = this.startId || 0
    if (config) {
      this.add(config)
    }
  }

  render () {
    return this.compiled.join('')
  }

  count () {
    return this.compiled.length
  }

  /**
   *
   * @param info
   * @return {Number} Style element index
   */
  add (info) {
    this.elements.push(info)
    info.id = this.startId
    this.startId++
    if (info.code) {
      this.named[info.code] = info.id
    }
    this.compile(info)
    return info.id
  }

  compileTemplate () {
    throw new Error('You must override function compileTemplate.')
  }

  compile (element) {
    this.compiled.push(this.compileTemplate(element)) // tpl.apply(element)
  }
}

module.exports = XLSXBaseStyleElement
