/*
 +0. builders in separate modules
 1. Export functions:
 + buildSelectSql
 - buildInsertSql
 - buildUpdateSql
 - buildDeleteSql
 +2. delete SQL class - do all in builder class
 +3. may be separate classes for items
 +4. logical predicates
 5. order
 6. groupBy
 7. distinct
 +8. joinAs
 9. options(limit etc)
 10. Complex fiel parsing
 */

/*
 ? property description: RawUTF8 read fDescription write fDescription;
 - property disableCache: Boolean read FDisableCache write FDisableCache default False;
 + property entityName: RawUTF8 read FEntityName write FEntityName;
 - property distinct: Boolean read FDistinct write FDistinct default False;
 + property fieldList: TubSQLFieldList read FfieldList;
 - property execFieldList: TubSQLFieldList read FExecFieldList;
 - property logicalPredicates: TRawUTF8DynArray read fLogicalPredicates write SetLogicalPredicates;
 - property joinAs: TRawUTF8DynArray read fJoinAsPredicates write SetJoinAsPredicates;
 + property whereList: TubSQLWhereList read FwhereList;
 - property orderList: TubSQLOrderList read ForderList;
 - property groupList: TubSQLGroupList read FGroupList;
 - property options: TubSQLOptions read Foptions;
 - property execParams: TubList read FExecParams;
 ? property isCustomSQL: Boolean read FIsCustomSQL write FIsCustomSQL default False;
 ? property customSQL: RawUTF8 read FCustomSQL write FCustomSQL;
 { Парсить текст запроса на предмет определения параметров. Почти всегда это True и только в одном конкретном случае с полнотекстовым поиском нет }
 ? property needParseExprForParams: Boolean read FNeedParseExprForParams write FNeedParseExprForParams default True;
 { Имя поля, который является идетификатором и которое будет в условии WHERE при построении UPDATE SQL }
 ? property IDFieldName: RawUTF8 read FIDFieldName write FIDFieldName;
 /// Параметры ALS
 ? property alsNeed: Boolean read FalsNeed write FalsNeed default False;
 ? property alsCurrState: RawUTF8 read FalsCurrState write FalsCurrState;
 ? property alsCurrRoles: TRawUTF8DynArray read FalsCurrRoles write SetAlsCurrRoles;
 */
/**
 * Created by v.orel on 05.01.2017.
 */
const UB_ID = 'ID'
const UB_BRACKET_ID = '[ID]'
const UB_SFN_AllFields = '*'
const reOneBracketField = /^\[(.*)]$/
const deniedNotSimpleExpr = true
const chars = {
  opBracket: '['.charCodeAt(0),
  clBracket: ']'.charCodeAt(0),
  lang: '^'.charCodeAt(0),
  namedParam: ':'.charCodeAt(0),
  nativeSQL: '#'.charCodeAt(0),
  dot: '.'.charCodeAt(0),
  coma: ','.charCodeAt(0),
  opRBracket: '('.charCodeAt(0),
  clRBracket: ')'.charCodeAt(0),
  param: '?'.charCodeAt(0),
  opFBracket: '{'.charCodeAt(0),
  clFBracket: '}'.charCodeAt(0),
  gt: '>'.charCodeAt(0),
  lt: '<'.charCodeAt(0),
  eq: '='.charCodeAt(0),
  space: '='.charCodeAt(0),
  chA: 'A'.charCodeAt(0),
  chZ: 'Z'.charCodeAt(0),
  cha: 'a'.charCodeAt(0),
  chz: 'z'.charCodeAt(0),
  ch0: '0'.charCodeAt(0),
  ch9: '9'.charCodeAt(0),
  ch_: '_'.charCodeAt(0),
  chAmp: '@'.charCodeAt(0),
  upperDelta: 'a'.charCodeAt(0) - 'A'.charCodeAt(0),
  isIdentifier: function (ch) {
    return ((ch >= chars.ch0) && (ch <= chars.ch9)) ||
      ((ch >= chars.chA) && (ch <= chars.chZ)) ||
      ((ch >= chars.cha) && (ch <= chars.chz)) ||
      (ch === chars.ch_)
  }
}
const dbFieldServiceFuncs = {
  'SUM': true,
  'COUNT': true,
  'AVG': true,
  'MAX': true,
  'MIN': true,
  'CAST': true,
  'COALESCE': true,
  'LENGTH': true,
  'LOWER': true,
  'UPPER': true,
  'DAY': true,
  'MONTH': true,
  'YEAR': true,
  'ROUND': true,
  'FLOOR': true,
  'CEILING': true,
  'MASTER': true,
  'SELF': true
}
const reBracketField = /\[([^\]]*)]/g
const reExprWithDot = /([^.]*)\./
const parserUtils = {
  extractExpressionProps: function (expression, {onlyDot = false, onlyOpenBracket = false}) {
    const res = {
      isAttributeExpression: true,
      simpleExpression: true
    }
    let ch
    let expr = {
      expression,
      length: expression.length,
      curPos: 0
    }
    let insideAttrExpr = false
    let servExprBrCounter = 0
    // let subQueryExprBrCounter = 0
    let insideSubQueryExpr = false
    while (expr.curPos < expr.length) {
      ch = expression.charCodeAt(expr.curPos)
      if (ch === chars.opBracket) {
        res.existOpenBracket = true
        if (onlyOpenBracket) {
          break
        }
        insideAttrExpr = true
      } else if (ch === chars.clBracket) {
        res.existCloseBracket = true
        insideAttrExpr = false
      } else if (ch === chars.lang) {
        res.existLangPointer = true
      } else if (ch === chars.namedParam) {
        res.existNamedParam = true
      } else if (ch === chars.nativeSQL) {
        res.existNativeSQL = true
      } else if (ch === chars.dot) {
        res.existDot = true
        if (onlyDot) {
          break
        }
      } else if ((ch === chars.coma) || (ch === chars.opRBracket) || (ch === chars.clRBracket) || (ch === chars.param)) {
        res.isAttributeExpression = false
        if (!insideAttrExpr || !res.existOpenBracket) {
          if (ch === chars.opRBracket) {
            servExprBrCounter++
            if (!parserUtils._findServiceExprBackFrom(expr)) {
              res.simpleExpression = false
            } else {
              res.existServiceExpr = true
            }
          } else if (ch === chars.clRBracket) {
            if (servExprBrCounter <= 0) {
              res.simpleExpression = false
            }
            servExprBrCounter--
          } else {
            res.simpleExpression = false
          }
        }
      } else if ((ch === chars.opFBracket) || (ch === chars.clFBracket)) {
        if (ch === chars.clFBracket) {
          // subQueryExprBrCounter--
          if (!parserUtils._findServiceExprBackFrom(expr)) {
            res.simpleExpression = false
          } else {
            res.existServiceExpr = true
          }
          insideSubQueryExpr = false
        } else {
          insideSubQueryExpr = true
          // subQueryExprBrCounter++
        }
      } else if ((ch === chars.gt) || (ch === chars.lt) || (ch === chars.eq)) {
        res.isAttributeExpression = false
        if (!res.existOpenBracket) {
          res.simpleExpression = false
        }
      } else if (ch === chars.space) {
        res.isAttributeExpression = false
      } else if (chars.isIdentifier(ch)) {
        if (!insideAttrExpr && !insideSubQueryExpr && res.existOpenBracket) {
          res.simpleExpression = false
        }
      } else {
        if (!parserUtils._isExprLink(expr)) {
          res.simpleExpression = false
        }
      }
    }
    return res
  },
  bracketExpr (expression) {
    const props = parserUtils.extractExpressionProps(expression)
    const expr = ['', expression, '']
    if (props.isAttributeExpression && !props.existNativeSQL && !props.existOpenBracket) {
      expr[0] = '['
      props.existOpenBracket = true
    }
    if (props.isAttributeExpression && !props.existNativeSQL && !props.existCloseBracket) {
      expr[2] = ']'
      props.existCloseBracket = true
    }
    return {props, expression: expr.join('')}
  },
  splitBracketExpressions: function (expression, withBracket) {
    const expressions = []
    let res
    do {
      res = reBracketField.exec(expression)
      if (res) {
        expressions.push(res[withBracket ? 0 : 1])
      }
    } while (res)
    return expressions
  },
  expressionFirstWord: function (expression) {
    const res = reExprWithDot.exec(expression)
    return res ? res[1] : expression
  },
  extractOneExprLink: function (expression) {
    let existLink = false
    let expr = {
      expression,
      length: expression.length,
      curPos: 0
    }
    while (expr.curPos < expr.length) {
      if (parserUtils._isExprLink(expr)) {
        existLink = true
        break
      }
      expr.curPos++
    }
    if (existLink) {
      return {
        existLink,
        expression: expression.substr(expr.curPos),
        essLink: expression.substr(0, expr.curPos - 2)
      }
    } else {
      return {existLink, expression}
    }
  },
  extractAttrAndLang: function (expression) {
    // todo
    return 1
  },
  _isExprLink: function (expr) {
    if (expr.expression.charCodeAt(expr.curPos) === chars.chAmp) {
      if (chars.isIdentifier(expr.expression.charCodeAt(expr.curPos - 1))) {
        return true
      }
      chars.chAmp++
    }
    return false
  },
  _findServiceExprBackFrom: function (expr) {
    let pos = expr.curPos
    if (pos === 0) {
      return false
    }
    let haveData = false
    let ch
    while (pos >= 0) {
      ch = expr.expression.charCodeAt(pos--)
      if (chars.isIdentifier(ch)) {
        haveData = true
      } else break
    }
    if (!haveData) {
      return false
    }
    return !!dbFieldServiceFuncs[expr.subStr(pos + 1, expr.curPos - pos).toUpperCase()]
  }
}

class Expression {

  constructor (builder, expression, isExternal) {
    let parseExpr = expression
    let langPrefix = builder.langPrefix
    let method = builder.method
    this.builder = builder

    if ((expression === UB_ID) || (expression === UB_BRACKET_ID)) {
      builder.idColumn = this
    }

    if (deniedNotSimpleExpr && isExternal) {
      const exprProps = parserUtils.extractExpressionProps(expression, {})
      if ((!exprProps.isAttributeExpression && !exprProps.existServiceExpr) || !exprProps.simpleExpression) {
        // todo
        throw new Error(`Invalid expression ${expression} from external call. In this mode server support only simple attribute expressions`)
      }
    }

    this.expression = this.prepareSQLExpression(expression, 'root')
  }
  prepareSQLExpression (expression, level, manyAttrExprCollapsed) {
    if (expression === UB_SFN_AllFields) {
      this.fieldName = ''
      return UB_SFN_AllFields
    }
    // todo may be check that entity is from correct db
    // let originalExpression = expression
    let {expression: inExpression, props: exprProps} = parserUtils.bracketExpr(expression)

    if (exprProps.existOpenBracket && !exprProps.existCloseBracket) {
      throw new Error(`Error in expression "${expression}": "]" expected but "[" found`)
    } else if (!exprProps.existOpenBracket && exprProps.existCloseBracket) {
      throw new Error(`Error in expression "${expression}": "[" expected but "]" found`)
    }

    // todo EntityList.AddEntity(aProcessEntity);

    if (!exprProps.existNativeSQL) {
      const exprList = parserUtils.splitBracketExpressions(inExpression, false)
      if (exprList.length === 0) {
        // there is no open and close brackets so left all as is
        builder.expressions.add({
          attrEntityName: '',
          attributeName: '',
          isMultiLang: false,
          lang: builder.langPrefix,
          existLangPointer: false,
          expression: inExpression,
          nonPrefixExpression: inExpression
        })
        // todo ??? fPreparedExpression.SetExpressionType(sqletExpression, aExpressionList);
        return inExpression
      } else {
        for (let expr of exprList) {
          exprProps = parserUtils.extractExpressionProps(expr, false)
          let partExpr = parserUtils.expressionFirstWord(expr)
          let exprLinkProps = parserUtils.extractOneExprLink(partExpr)
          partExpr = exprLinkProps.expression
          if (exprLinkProps.existLink && (level === 'root')) {
            // before registration of link-attribute we must register ID of parent entity, but only for root level
            // todo
            this.registerSimpleExpression({
              expression: UB_ID,
              fullExpr: UB_ID,
              level,
              /* parentAssocExpr: '',
              exprProps: {},
              exprLinkProps: */
              manyAttrExprCollapsed
            })
          }
          // todo
          this.registerSimpleExpression()
          // may bymove unity logic to mixin
          // if there is link to other entity by UNITY then create JOIN here
          // but only for root level because for non-root level link is already created
          if (exprLinkProps.existLink (level === 'root')) {
            // todo
            this.registerSimpleExpression()
          }
          // todo
          let fAttrItem
          // if it is simple expression or it is many-attr than it is in result
          if (!exprProps.existDot || (fAttrItem.dataType === 'Many')) {
            // todo
          } else {
            if (fAttrItem.dataType !== 'Enum') {

            } else {

            }
          }
        }
      }
    }

    return 1
  }
  registerSimpleExpression ({expression, fullExpr, level, exprProps, exprLinkProps, manyAttrExprCollapsed, entity}) {
    // todo
    let simpleExpr
    let attrEntity
    // out params
    let attribute
    let langPrefix
    // aBldExprItem
    // aBldDSItem
    // aBldFieldData
    // aBldDSData

    if (!exprProps || !exprProps.existLangPointer) {
      langPrefix = ''
      simpleExpr = expression
    } else {
      const res = parserUtils.extractAttrAndLang(expression)
      simpleExpr = res.noLangExpr
      langPrefix = res.langPrefix
    }
    if (!exprLinkProps || !exprLinkProps.existLink) {
      attrEntity = entity
      attribute = attrEntity.attributes[simpleExpr]
    } else {
      attrEntity = App.domain_.get(exprLinkProps.essLink)
      // todo check entity exists
      // todo check entity has UNITY mixin - may be move to mixin
      // todo check  attrEntity.mixins.unity.entity is entity.name
      attribute = attrEntity.attributes[simpleExpr]
    }
    if (!attribute) {
      throw new Error(`Attribute ${attrEntity.name}.${simpleExpr} not exist`)
    }

    // todo create ds
    // todo create field

    this.registerFieldData()

    return {attribute, langPrefix}
  }
  /**
   * @param {CustomSQLBuilder} builder
   * @param {String} fieldExpr
   * @param {Boolean} notHandleNonBracket
   * @param {Boolean} withAlias
   */
  c1 (builder, fieldExpr, notHandleNonBracket = true, withAlias = false) {
    // todo handle *
    if ((fieldExpr === UB_ID) || (fieldExpr === UB_BRACKET_ID)) {
      builder.idColumn = this
    }
    // todo disable complex expressions in external call
    if (reOneBracketField.test(fieldExpr)) {
      this.initInternal(builder, reOneBracketField.exec(fieldExpr)[1], withAlias)
    } else {
      if (notHandleNonBracket) {
        this.expression = fieldExpr
      }
      this.initInternal(builder, fieldExpr, withAlias)
    }
  }
  /**
   * @param {CustomSQLBuilder} builder
   * @param {String} fieldExpr
   * @param {Boolean} withAlias
   */
  initInternal (builder, fieldExpr, withAlias = false) {
    const {ds, fieldName} = builder.datasources.parseAttribute(fieldExpr)
//
    let iFieldAlias = 1
    let fieldAlias = fieldName
    if (withAlias) {
      while (builder.fieldsAliases[fieldAlias]) {
        fieldAlias = fieldName + ++iFieldAlias
      }
      builder.fieldsAliases[fieldAlias] = 1
    }
    this.ds = ds
    this.expression = `${ds.alias}.${fieldAlias === fieldName ? fieldName : fieldName + ' AS ' + fieldAlias}`
  }
}

class ExpressionList {
  constructor () {
    this.items = []
  }
  add (item) {
    this.items.push(item)
  }
}

class WhereItem {
  /**
   * @param {String} expression
   */
  constructor (expression) {
    this.expression = null
  }
}

class WhereItemCustom extends WhereItem {
  /**
   * @param {String} expression
   */
  constructor (expression) {
    super()
    this.expression = expression
  }
}
class WhereItemWithField extends WhereItem {
  constructor (builder, expression) {
    super()
    this.field = builder.addFieldItem(expression)
  }
}
const conditionsCompare = {
  Equal: '=',
  NotEqual: '<>',
  More: '>',
  MoreEqual: '>=',
  Less: '<',
  LessEqual: '<='
}
class WhereItemCompare extends WhereItemWithField {
  /**
   * @param {CustomSQLBuilder} builder
   * @param {String} expression
   * @param {String} condition
   */
  constructor (builder, {expression, condition}) {
    super(builder, expression)
    this.expression = `${this.field.expression}${conditionsCompare[condition]}${builder.preparePositionParameterText()}'`
  }
}
class WhereItemBetween extends WhereItem {
  /**
   * @param {CustomSQLBuilder} builder
   * @param {String} expression
   */
  constructor (builder, {expression}) {
    let expressions = []
    let res
    do {
      res = reBracketField.exec(expression)
      if (res) {
        expressions.push(res[1])
      }
    } while (res)
    super()
    switch (expressions.length) {
      case 1:
        this.field = builder.addFieldItem(expressions[0])
        this.expression = `(${this.field.expression} BETWEEN ${builder.preparePositionParameterText()} AND ${builder.preparePositionParameterText()} )`
        break
      case 2:
        this.field = builder.addFieldItem(expressions[0])
        this.field2 = builder.addFieldItem(expressions[1])
        this.expression = `(${builder.preparePositionParameterText()} BETWEEN ${this.field.expression} AND ${this.field2.expression} )`
        break
      default :
        throw new Error(`Invalid expression "${expression}" for "between attributes" condition`)
    }
  }
}
const conditionsIn = {
  In: 'IN',
  NotIn: 'NOT IN'
}
class WhereItemIn extends WhereItemWithField {
  /**
   * @param {CustomSQLBuilder} builder
   * @param {String} expression
   * @param {String} condition
   * @param {*} values
   */
  constructor (builder, {expression, condition, values}) {
    const val = values[0]
    super(builder, expression)
    // todo replace JSON.stringify to normal parsing
    this.expression = `${builder.addFieldItem(expression).expression} ${conditionsIn[condition]} (${JSON.stringify(val)})`
  }
}
const conditionsNull = {
  IsNull: 'IS NULL',
  NotIsNull: 'IS NOT NULL'
}
class WhereItemNull extends WhereItemWithField {
  /**
   * @param {CustomSQLBuilder} builder
   * @param {String} expression
   * @param {String} condition
   */
  constructor (builder, {expression, condition}) {
    super(builder, expression)
    this.expression = `${builder.addFieldItem(expression).expression} ${conditionsNull[condition]}`
  }
}
const conditionsLike = {
  Like: '',
  NotLike: 'NOT',
  StartWith: '',
  NotStartWith: 'NOT'
}
class WhereItemLike extends WhereItemWithField {
  /**
   * @param {CustomSQLBuilder} builder
   * @param {String} expression
   * @param {String} condition
   */
  constructor (builder, {expression, condition}) {
    // todo add % to begin or end of value if needed
    super(builder, expression)
    this.expression = `${builder.addFieldItem(expression)} ${conditionsLike[condition]} ${builder.likePredicate} (?)`
  }
}
class WhereItemMatch extends WhereItem {
  /**
/   * @param {CustomSQLBuilder} builder
/   * @param {String} expression
/   * @param {String} condition
   */
  constructor (
  // builder, {expression, condition, values}
  ) {
    super()
    // todo
    this.a = 1
  }
}
const reLogicalPredicate = /\[([^\]]*)]/g
class LogicalPredicate {
  constructor (builder, expression) {
    this.expression = expression
    const knownPredicates = {}
    let predicate
    do {
      predicate = reLogicalPredicate.exec(expression)
      if (predicate) {
        if (!knownPredicates[predicate[1]]) {
          const whereItem = builder.where[predicate[1]]
          if (whereItem) {
            if (whereItem.inJoinAsPredicate) {
              throw new Error(`Logical predicate with name "${predicate}" already used in "joinAs" predicates`)
            }
            whereItem.inLogicalPredicate = true
            const re = new RegExp('(\\' + predicate[0] + ')', 'g')
            this.expression = this.expression.replace(re, whereItem.expression, 'g')
          } else {
            throw new Error(`Condition ${predicate[1]} not found`)
          }
          knownPredicates[predicate[1]] = true
        }
      }
    } while (predicate)
  }
}

class WhereItems {
  constructor (builder) {
    this.items = {}
    this.builder = builder
    this.logicalPredicates = []
  }
  add (itemName, {expression, condition, values}) {
    switch (condition) {
      case 'Custom':
      case 'SubQuery':
        this.items[itemName] = new WhereItemCustom(expression)
        break
      case 'Equal':
      case 'NotEqual':
      case 'More':
      case 'MoreEqual':
      case 'Less':
      case 'LessEqual':
        this.items[itemName] = new WhereItemCompare(this.builder, {expression, condition, values})
        break
      case 'Between':
        this.items[itemName] = new WhereItemBetween(this.builder, {expression, values})
        break
      case 'In':
      case 'NotIn':
        this.items[itemName] = new WhereItemIn(this.builder, {expression, condition, values})
        break
      case 'IsNull':
      case 'NotIsNull':
        this.items[itemName] = new WhereItemNull(this.builder, {expression, condition, values})
        break
      case 'Like':
      case 'NotLike':
      case 'StartWith':
      case 'NotStartWith':
        this.items[itemName] = new WhereItemLike(this.builder, {expression, condition, values})
        break
      case 'Match':
        this.items[itemName] = new WhereItemMatch({expression, condition, values})
        break
      default:
        throw new Error(`Unknown condition: ${condition}`)
    }
  }
  addJoinAsPredicate (expression) {
    const whereItem = this.items[expression]
    if (whereItem) {
      whereItem.inJoinAsPredicate = true
      if (whereItem.field && whereItem.field.ds) {
        whereItem.field.ds.where.push(whereItem)
      }
    }
  }
  addLogicalPredicate (predicate) {
    this.logicalPredicates.push(new LogicalPredicate(predicate))
  }
  get expression () {
    let isFirstWhere = true
    const res = []
    function pushNext (expression) {
      if (isFirstWhere) {
        res.push(' WHERE ')
      } else {
        res.push(' AND ')
      }
      res.push(expression)
    }

    for (let itemName in this.items) {
      const whereItem = this.where[itemName]
      if (!whereItem.inLogicalPredicate && !whereItem.inJoinAsPredicate) {
        pushNext(whereItem.expression)
      }
    }

    for (let logicalPredicate of this.logicalPredicates) {
      pushNext(logicalPredicate.expression)
    }

    return res.join('')
  }
}
class DataSource {
  constructor (entity) {
    this.entity = entity
    this.alias = entity.sqlAlias
  }
  get expression () {
    return `${this.prefix} ${this.entity.code} ${this.alias} ${this.sufix} ${this.where.count === 0 ? '' : ' AND ' + this.where.join(' AND ')}`
  }
}
class DataSourceJoin extends DataSource {
  constructor (entity, alias, allowNull, parent, parentAttr) {
    super(entity)
    this.alias = alias
    this.allowNull = allowNull
    this.prefix = this.allowNull ? 'LEFT JOIN' : 'INNER JOIN'
    this.sufix = `ON ${this.alias}.ID=${parent.alias}.${parentAttr}`
    this.where = []
  }
}

class DataSources {
  constructor (builder) {
    this.entity = builder.entity
    this.datasources = [new DataSource(this.entity)]
    this.datasources.byAlias = {}
    this.datasources.byAttribute = {}
  }
  parseAttribute (attribute) {
    const fieldParts = attribute.split('.')
    let curEntity = this.entity
    let curAttr = ''
    let ds = this.datasources[0]

    for (let i = 0; i < fieldParts.length - 1; i++) {
      const part = fieldParts[i]
      const attr = curEntity.attributes[part]
      curEntity = attr.getAssociatedEntity()
      if (curEntity) {
        const prevDS = ds
        curAttr = curAttr ? curAttr + '.' + part : part
        ds = this.datasources.byAttribute[curAttr]
        if (!ds) {
          const dsAlias = curEntity.sqlAlias
          let curAlias = dsAlias
          let dsAliasIndex = 1
          while (this.datasources.byAlias[curAlias]) {
            curAlias = dsAlias + (++dsAliasIndex)
          }
          ds = this.datasources.byAlias[curAlias] = this.datasources.byAttribute[curAttr] =
            new DataSourceJoin(curEntity, curAlias, attr.allowNull || prevDS.allowNull, prevDS, part)
        }
      } else {
        throw new Error(`Association entity in attribute "${part}" of object "${curEntity}" is empty`)
      }
    }
    const fieldName = fieldParts[fieldParts.length - 1]

    return {ds, fieldName}
  }
  get expression () {
    const res = []
    for (let datasource of this.datasources) {
      res.push(datasource.expression)
    }
    return res.join(' ')
  }
}

class CustomSQLBuilder {
  constructor ({entity, fieldList, whereList, logicalPredicates, joinAs, options}) {
    // todo dialect from entity connection
    this.entity = App.domain_.get(entity)
    // this.method = method
    this.fields = []
    this.fieldsAliases = {}
    this.expressions = new ExpressionList(this)
    this.datasources = new DataSources(this)

    // todo handle start, limit
    this.options = options || {}
    // todo handle custom sql
    // todo handle execFieldList
    // todo handle als ???
    // todo handle insert
    // todo handle multilang

    for (let fieldExpr of fieldList) {
      this.fields.push(this.addFieldItem(fieldExpr, false, true))
      // todo handle for update disable using [name] and [name^]
    }
    // todo handle insert multilang
    this.whereItems = new WhereItems()

    for (let itemName in whereList) {
      this.whereItems.add(itemName, whereList[itemName])
    }

    if (joinAs) {
      for (let joinAsPredicate of joinAs) {
        this.whereItems.addJoinAsPredicate(joinAsPredicate)
      }
    }
    if (logicalPredicates) {
      for (let logicalPredicate of logicalPredicates) {
        this.whereItems.addLogicalPredicate(logicalPredicate)
      }
    }
  }
  /**
   * @returns {string}
   */
  buildBaseSelectQuery () {
    const parts = ['SELECT ']
    if (this.fieldsPrefix) {
      parts.push(this.fieldsPrefix)
      parts.push(' ')
    }
    if (this.fields.length === 0) {
      parts.push('null')
    } else {
      for (let field of this.fields) {
        parts.push(field.expression)
      }
    }
    if (this.fieldsSuffix) {
      parts.push(this.fieldsSuffix)
    }
    parts.push(' FROM ')
    parts.push(this.datasources.expression)

    parts.push(this.whereItems.expression)

    // todo assign groupby
    if (this.groupby) {
      parts.push(' GROUP BY ')
      parts.push(this.groupby)
    }
    // todo assign orderby
    if (this.orderby) {
      parts.push(' ORDER BY ')
      parts.push(this.orderby)
    }
    return parts.join('')
  }
  buildSelectQuery () {
    return this.buildBaseSelectQuery()
  }
  /**
   * @param {String} fieldExpr
   * @param {Boolean} notHandleNonBracket
   * @param {Boolean} withAlias
   * @returns {Expression}
   */
  addFieldItem (fieldExpr, notHandleNonBracket = true, withAlias = false) {
    return new Expression(this, fieldExpr, notHandleNonBracket, withAlias)
  }
  preparePositionParameterText () {
    return '?'
  }
  get likePredicate () {
    return 'LIKE'
  }
}

module.exports = CustomSQLBuilder

// /**
// * @class SQL
// * @property {String} __description
// * @property {Boolean} __mip_disablecache
// * @property {Boolean} distinct
// * @property {Boolean} alsNeed
// * @property {String} __alsCurrState
// * @property {String} __alsCurrRoles
// * @property {String} entity +
// * @property {Array<String>} fieldList +
// * @property {Array<WhereItem>} whereList +
// * @property {Array<String>} logicalPredicates +
// * @property {Array<String>} joinAs +
// * @property {Array<OrderItem>} orderList
// * @property {Array<String>} groupList
// * @property {Options} options
// * @property {Object} execParams
// */

