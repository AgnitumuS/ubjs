/**
 * Created by v.orel on 11.01.2017.
 */
const parserUtils = require('./parserUtils')
class LangAttribute {
  constructor (builder, expression) {
    this.attributeName = expression.attributeName
    this.lang = []
    this.existLangPointer = expression.existLangPointer
    this.noLangPointer = !expression.existLangPointer

    const lang = (expression.lang || App.defaultLang).toLowerCase()

    if (!this.lang.includes(lang)) {
      this.lang.push(lang)
      if (lang === builder.lang) {
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
        if (builder.execParams[langAttrValueName]) {
          this.defaultLangValues = builder.execParams[langAttrValueName]
        }
      }
    }
  }
}

class LangAttributeList {
  constructor () {
    this.items = {}
  }
  register (builder, preparedExpressions) {
    for (let expression of preparedExpressions) {
      const langAttrName = `${parserUtils.rootLevel}.${expression.attributeName}`
      if (!this.items[langAttrName]) {
        this.items[langAttrName] = new LangAttribute(builder, expression)
      }
    }
  }
  checkUsingForUpdate () {
    for (let langAttrName in this.items) {
      const langAttrForUpdate = this.items[langAttrName]
      if (langAttrForUpdate.existLangPointer && langAttrForUpdate.noLangPointer) {
        // todo EMetabaseException
        throw new Error(`Invalid using lang pointer in attribute "${langAttrForUpdate.attributeName}" for update operation`)
      }
    }
  }
  addFieldsForInsert (builder, columns) {
    const storedLang = builder.lang
    for (let langAttrName in this.items) {
      const langAttrForInsert = this.items[langAttrName]
      for (let lang of builder.entity.connectionConfig.supportLang) {
        if (lang !== builder.lang) {
          if (langAttrForInsert.lang.includes(lang)) {
            builder.lang = lang
            const column = columns._add(langAttrForInsert.attributeName, false)
            builder.lang = storedLang
            if ((Object.keys(langAttrForInsert.defaultLangValues).length > 0) && (column.PreparedExpressions.length > 0)) {
              builder.execParams[column.PreparedExpressions[0].nonPrefixSQLExpression] = langAttrForInsert.defaultLangValues[Object.keys(langAttrForInsert.defaultLangValues)[0]]
            }
          }
        }
      }
    }
  }
}

class Column {
  constructor (builder, langAttributeList, expression, isExternal) {
    this.builder = builder
    this.preparedExpressions = []
    let exprProps
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
      langAttributeList.register(builder, this.preparedExpressions)
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
        langAttributeList.register(builder, this.preparedExpressions)
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
}
class ColumnList {
  /**
   * List of columns for builder
   * @param {CustomSQLBuilder} builder
   * @param {Array} fieldList
   */
  constructor (builder, fieldList) {
    this.items = []
    this.builder = builder
    this.langAttributeList = new LangAttributeList()

    for (let fieldItem of fieldList) {
      // todo is external
      const isExternal = false
      this._add(fieldItem, isExternal)
    }

    // For update operation deny use the same attr with and without lang pointer "[name]" and "[name^]" in the same time
    if (builder.execType === 'update') {
      this.langAttributeList.checkUsingForUpdate()
    }
    if ((builder.execType === 'insert') && !builder.isDataSourceCusomSQL) {
      this.langAttributeList.addFieldsForInsert(builder, this)
    }
  }

  /**
   * Add column to list
   * @param {String} expression
   * @param {Boolean} isExternal
   * @returns {Column}
   */
  _add (expression, isExternal = false) {
    const column = new Column(this.builder, this.langAttributeList, expression, isExternal)
    this.items.push(column)
    if ((expression === parserUtils.ubID) || (expression === parserUtils.ubBracketID)) {
      this.idColumn = column
    }
    return column
  }
  registerName (nonPrefixExpression, baseName, notFoundResultAsEmptyStr, useBaseName) {
    let res
    if (!this.items[nonPrefixExpression]) {
      this.items[nonPrefixExpression] = true
      res = notFoundResultAsEmptyStr ? '' : (useBaseName ? baseName : nonPrefixExpression)
    } else {
      for (let i = 2; i < Number.MAX_SAFE_INTEGER; i++) {
        res = `${useBaseName ? baseName : nonPrefixExpression}${i}`
        if (!this.items[res]) {
          this.items[res] = true
          break
        }
      }
    }
    return res
  }
}

module.exports = ColumnList