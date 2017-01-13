/**
 * Created by v.orel on 11.01.2017.
 */
const parserUtils = require('./parserUtils')
class Column {
  constructor (builder, expression, isExternal) {
    let exprProps
    this.preparedExpressions = []
    if (parserUtils.deniedNotSimpleExpr && isExternal) {
      exprProps = parserUtils.extractExpressionProps(expression, {})
      if ((!exprProps.isAttributeExpression && !exprProps.existServiceExpr) || !exprProps.simpleExpression) {
        // todo EMetabaseException
        throw new Error(`Invalid expression ${expression} from external call. In this mode server support only simple attribute expressions`)
      }
    }
    const expr = builder.expressions.add({
      originalExpression: expression,
      expressionList: this.preparedExpressions,
      attrExpression: expression,
      lang: this.builder.lang,
      entity: builder.entity,
      level: parserUtils.rootLevel,
      manyAttrExprCollapsed: true,
      complexAttrExpression: expression,
      // whereItem,
      // parentJoin,
      registerInColumnList: true
    })
    this.expression = expr.expr
    this.fieldName = expr.fieldName
    this._establishResultName(builder.columns)
    if (((this.builder.execType === 'insert') || (this.builder.execType === 'update')) && this.preparedExpressions.haveMultiLang) {
      this._registerLangAttr()
    }
    exprProps = parserUtils.extractExpressionProps(this.expression, {onlyOpenBracket: true})
    while (exprProps.existOpenBracket) {
      expression = this.expression
      /*
      { Внимание! Важный момент! Выражение AddedColumn.Expression может быть сложным и состоять из многих атрибутов,
        в том числе и атрибутов разных сущностей. Поэтому 2-й параметр в PrepareSQLExpression нужна сущность,
        которая является родной к выражению AddedColumn.Expression:
        например: выше выражение было b_id.caption, соотв. параметром должнв пойти сущность B, к которой принадлежит caption,
        а не сущность A, которая является контекстов вызова (у нас это AEntity).
        А теперь представим что выражение имеет вид b_id.caption + c_id.caption ...
        Проблема в том, что пока не могу понять, как передать туда список сущностей, а не ПЕРВУЮ }
      // Felix TODO
      */
      let entity, level
      if ((this.preparedExpressions.length === 1) && (this.preparedExpressions[0].attrEntityName)) {
        entity = App.domain_.get(this.preparedExpressions[0].attrEntityName)
        level = this.preparedExpressions[0].level
      } else {
        entity = this.builder.entity
        level = parserUtils.rootLevel
      }
      this.expression = builder.expressions.add({
        originalExpression: expression,
        expressionList: this.preparedExpressions,
        attrExpression: expression,
        lang: this.builder.lang,
        entity,
        level,
        manyAttrExprCollapsed: true,
        complexAttrExpression: expression,
        // whereItem,
        // parentJoin,
        registerInColumnList: false
      }).expr
      if ((this.builder.execType === 'insert') && (this.preparedExpressions.haveMultiLang)) {
        this._registerLangAttr()
      }
      exprProps = parserUtils.extractExpressionProps(this.expression, {onlyOpenBracket: true})
    }
  }
  _establishResultName (columns) {
    if (this.fieldName) {
      this.resultName = this.fieldName
    } else {
      if (this.preparedExpressions.length === 1) {
        this.resultName = this.preparedExpressions[0].nonPrefixExpression
      } else {
        const {nonPrefixExpression, attributeName} = this.preparedExpressions[0]
        this.resultName = columns.registerName(nonPrefixExpression, attributeName, false, true)
      }
      if (!this.resultName) {
        // todo may be optimize
        this.resultName = `f${Math.round(Math.random() * 1000000000)}`
      }
    }
  }
  _registerLangAttr () {
    for (let expression of this.preparedExpressions) {
      const langAttrName = `${parserUtils.rootLevel}.${expression.attributeName}`
      let attribute = this.builder.langAttributeList[langAttrName]
      if (!attribute) {
        // todo may be to separate module and class
        attribute = this.builder.langAttributeList[langAttrName] = {
          root: parserUtils.rootLevel,
          attributeName: expression.attributeName,
          lang: []
        }
        if (expression.existLangPointer) {
          attribute.existLangPointer = true
        } else {
          attribute.noLangPointer = true
        }
        const lang = (expression.lang || App.defaultLang).toLowerCase()
        if (!attribute.lang.includes(lang)) {
          attribute.lang.push(lang)
          if (lang === this.builder.lang) {
            let langAttrValueName
            if (!expression.existLangPointer) {
              langAttrValueName = expression.attributeName
            } else {
              if (lang === App.defaultLang) {
                langAttrValueName = `${expression.attributeName}^`
              } else {
                langAttrValueName = `${expression.attributeName}_${lang}^`
              }
            }
            if (this.builder.execParams[langAttrValueName]) {
              attribute.defaultLangValues = this.builder.execParams[langAttrValueName]
            }
          }
        }
      }
    }
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
    return column
  }
  registerName (nonPrefixExpression, baseName, notFoundResultAsEmptyStr, useBaseName) {
    // todo
    return 'todo'
  }
}

module.exports = ColumnList