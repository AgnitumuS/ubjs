/**
 * Created by v.orel on 11.01.2017.
 */
const parserUtils = require('./parserUtils')
class Column {
  constructor (builder, expression, isExternal) {
    const langPrefix = this.builder.userLang
    const savedProcMethod = this.builder.method

    if (parserUtils.deniedNotSimpleExpr && isExternal) {
      const exprProps = parserUtils.extractExpressionProps(expression, {})
      if ((!exprProps.isAttributeExpression && !exprProps.existServiceExpr) || !exprProps.simpleExpression) {
        // todo EMetabaseException
        throw new Error(`Invalid expression ${expression} from external call. In this mode server support only simple attribute expressions`)
      }
    }
    this.expression = builder.expressions.add(expression, parserUtils.rootLevel)
    // todo
  }
}
class ColumnList {
  /**
   * List of columns for builder
   * @param {CustomSQLBuilder} builder
   */
  constructor (builder) {
    this.items = []
    this.builder = builder
  }

  /**
   * Add column to list
   * @param {String} expression
   * @param {Boolean} isExternal
   * @returns {Column}
   */
  add (expression, isExternal = false) {
    const column = new Column(this.builder, expression, isExternal)
    this.items.push(column)
    if ((expression === parserUtils.ubID) || (expression === parserUtils.ubBracketID)) {
      this.idColumn = column
    }
    // todo ?
    return column
  }
  registerName (nonPrefixExpression, baseName, notFoundResultAsEmptyStr, useBaseName) {
    // todo
    return 'todo'
  }
}

module.exports = ColumnList