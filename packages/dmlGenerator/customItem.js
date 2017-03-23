/**
 * Created by v.orel on 20.01.2017.
 */
const reSimpleExpression = /^[SUM|COUNT|AVG|MAX|MIN|CAST|COALESCE|LENGTH|LOWER|UPPER|DAY|MONTH|YEAR|ROUND|FLOOR|CEILING|MASTER|SELF|(]*\[?[\w.@]*]?\)*$/
const reBrackedExpression = /(\[[\w.@]*])/
const reAttrExpression = /^[^\s<>=,()?)]*$/

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
    /**
     * @class CustomItem
c     */
    // todo
    this.isSimple = reSimpleExpression.test(expression)
    if (this.isSimple && reAttrExpression.test(expression)) {
      if (expression.charAt(0) !== '[') {
        expression = '[' + expression
      }
      if (expression.charAt(expression.length - 1) !== ']') {
        expression = expression + ']'
      }
    }
    this.expression = expression
    const expressionParts = expression.split(reBrackedExpression)
    console.log(expressionParts)
    let expressionPart
    for (let expressionPartIndex = 0; expressionPartIndex < expressionParts.length; expressionPartIndex++) {
      expressionPart = expressionParts[expressionPartIndex]
      if (expressionPart.charAt(0) === '[' || expressionPart.charAt(expressionPart.length - 1) === ']') {
        expressionPart = expressionPart.substr(1, expressionPart.length - 2)
      } else {
        continue
      }
      /**
       * @type {DataSource}
       */
      this.dataSource = dataSource
      // todo check isAlready parsed
      const predicates = expressionPart.split('.')
      /**
       * @type {UBEntityAttribute}
       */
      let attribute
      let i
      for (i = 0; i < predicates.length - 1; i++) {
        const predicate = predicates[i]
        // todo this.dataSource cache
        let linkEntity
        if (predicate.indexOf('@') !== -1) {
          const complexAttr = predicate.split('@')
          linkEntity = complexAttr[1]
          attribute = this.dataSource.entity.attributes[complexAttr[0]]
        } else {
          attribute = this.dataSource.entity.attributes[predicate]
        }
        if (attribute.dataType === App.domainInfo.ubDataTypes.Many) {
          // debugger
          const b = require('@unitybase/dmlGenerator')
          const sub = predicates.slice(i + 1, predicates.length)
          const subQ = b.biuldSelectSql(attribute.associationManyData, {
            // fieldList: [`substr(extract(xmlagg(xmlelement("X", ','||nvl([destID], '-1'))), 'X/text()').getstringval(), 2)`],
            fieldList: [`',' + Cast([destID${sub.length === 0 ? '' : '.' + sub.join('.')}] as varchar)`],
            whereList: {c: {
              expression: `[sourceID]=${this.dataSource.alias}.ID`,
              condition: 'custom'
            }}
          }, dataSource)
          console.log(subQ)
//          expressionParts[expressionPartIndex] = subQ.sql
          this.expression = `stuff((${subQ.sql} for xml path('')), 1, 1, '')`
          return
          // throw new Error('todo')
          // todo many atribute
        } else {
          this.dataSource = this.dataSource.addChild(attribute)
          if (linkEntity) {
            this.dataSource = this.dataSource.addLink(linkEntity)
          }
        }
      }
      expressionParts[expressionPartIndex] = `${this.dataSource.alias}.${predicates[i]}`
    }
    /**
     * @class CustomItem
     * @public
     * @property {string} expression parsed expression
     */
    this.expression = expressionParts.join('')
  }
}
module.exports = CustomItem