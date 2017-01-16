/**
 * Created by v.orel on 14.01.2017.
 */
// todo may be common parent for columns, where, order and group by
const parserUtils = require('./parserUtils')
const maxSQLBuilderCyclingRef = 32
class GroupByItem {
  constructor (builder, item) {
    this.preparedExpressions = []
    this.expression = builder.expressions.add({
      originalExpression: item.name,
      expressionList: this.preparedExpressions,
      attrExpression: item.name,
      lang: builder.lang,
      entity: builder.entity,
      level: parserUtils.rootLevel,
      manyAttrExprCollapsed: true,
      complexAttrExpression: item.name,
      // whereItem,
      // parentJoin,
      registerInColumnList: true
    }).expr
    let runCounter = 0
    let exprProps = parserUtils.extractExpressionProps(this.expression)
    while (exprProps.existNamedParam || (exprProps.existOpenBracket && exprProps.existCloseBracket)) {
      if (runCounter++ >= maxSQLBuilderCyclingRef) {
        throw new Error(`Circular reference after ${maxSQLBuilderCyclingRef} steps on expression: ${this.expression}`)
      }
      let entity//, level
      if ((this.preparedExpressions.length === 1) && (this.preparedExpressions[0].attrEntityName)) {
        entity = App.domain_.get(this.preparedExpressions[0].attrEntityName)
        // level = this.preparedExpressions[0].level
      } else {
        entity = this.builder.entity
        // level = parserUtils.rootLevel
      }
      this.expression = builder.expressions.add({
        originalExpression: this.expression,
        expressionList: this.preparedExpressions,
        attrExpression: this.expression,
        lang: builder.lang,
        entity,
        level: parserUtils.rootLevel,
        manyAttrExprCollapsed: true,
        complexAttrExpression: this.expression,
        // whereItem,
        // parentJoin,
        registerInColumnList: true
      }).expr
      exprProps = parserUtils.extractExpressionProps(this.expression)
    }
  }
}
class GroupByList {
  constructor (builder, itemList) {
    this.builder = builder
    this.items = []

    for (let item in itemList) {
      this.items.push(new GroupByItem(item))
    }
  }
}
module.exports = GroupByList