/**
 * Created by v.orel on 14.01.2017.
 */
const parserUtils = require('./parserUtils')
const maxSQLBuilderCyclingRef = 32
class OrderByItem {
  constructor (builder, item) {
    this.orderByType = item.order
    this.isExternal = item.isExternal
    this.preparedExpressions = []
    const expressionIndexInFrom = builder.fieldList && builder.fieldList.indexOf(item.expression)
    if (expressionIndexInFrom >= 0) {
      this.expression = expressionIndexInFrom
    } else {
      this.expression = builder.expressions.add({
        originalExpression: item.expression,
        expressionList: this.preparedExpressions,
        attrExpression: item.expression,
        lang: builder.lang,
        entity: builder.entity,
        level: parserUtils.rootLevel,
        manyAttrExprCollapsed: true,
        complexAttrExpression: item.expression,
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
        let entity, level
        if ((this.preparedExpressions.length === 1) && (this.preparedExpressions[0].attrEntityName)) {
          entity = App.domain_.get(this.preparedExpressions[0].attrEntityName)
          level = this.preparedExpressions[0].level
        } else {
          entity = this.builder.entity
          level = parserUtils.rootLevel
        }
        this.expression = builder.expressions.add({
          originalExpression: this.expression,
          expressionList: this.preparedExpressions,
          attrExpression: this.expression,
          lang: builder.lang,
          entity,
          level,
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
}
class OrderByList {
  constructor (builder, itemList) {
    this.builder = builder
    this.items = []

    for (let item in itemList) {
      if (!item.expression) {
        // todo EMetabaseException
        throw new Error('Invalid or empty "expression" property in orderList item')
      }
      this.items.push(new OrderByItem(item))
    }
  }
}
module.exports = OrderByList