/**
 * Created by v.orel on 20.01.2017.
 */
const reSimpleExpression = /^[SUM|COUNT|AVG|MAX|MIN|CAST|COALESCE|LENGTH|LOWER|UPPER|DAY|MONTH|YEAR|ROUND|FLOOR|CEILING|MASTER|SELF|(]*\[?[\w.@]*]?\)*$/
const reBrackedExpression = /(\[[\w.@]*])/

class CustomItem {
  /**
   * Parse expression
   * @param {String} expression
   * @param {DataSource} dataSource
   */
  constructor (expression, dataSource) {
    /*
    - check expression is complex
    - find all [...]
    - for every [...] parse expression
     - split for .
     - for every part
      - check is @
       - if true - may be add link dataset
       - if false - is final
        - true - add expression
        - false - may be add join dataset
     */
    /**
     * @class CustomItem
     * @property {boolean} isSimple
     */
    // todo
    this.isSimple = reSimpleExpression.test(expression)
    this.expression = expression
    const expressionParts = expression.split(reBrackedExpression)
    let expressionPart
    for (let expressionPartIndex = 0; expressionPartIndex < expressionParts.length; expressionPartIndex++) {
      expressionPart = expressionParts[expressionPartIndex]
      /**
       * @type {DataSource}
       */
      let curDs = dataSource
      // todo check isAlready parsed
      const predicates = expressionPart.split('.')
      /**
       * @type {UBEntityAttribute}
       */
      let attribute
      let i
      for (i = 0; i < predicates.length - 1; i++) {
        const predicate = predicates[i]
        // todo curDs cache
        if (predicate.indexOf('@') !== -1) {
          // todo @
          break
        } else {
          attribute = curDs.entity.attributes[predicate]
        }
        if (attribute.dataType === App.domainInfo.ubDataTypes.Many) {
          // todo many atribute
        } else {
          curDs = curDs.addChild(attribute)
        }
      }
      expressionParts[expressionPartIndex] = `${curDs.alias}.${predicates[i]}`
    }
    this.childDS = {}
    /**
     * @class CustomItem
     * @public
     * @property {string} expression parsed expression
     */
    this.expression = expressionParts.join('')
  }
}
module.exports = CustomItem