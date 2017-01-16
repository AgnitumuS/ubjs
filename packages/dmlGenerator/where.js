/**
 * Created by v.orel on 13.01.2017.
 */
const parserUtils = require('./parserUtils')
const reParentDS = new RegExp(parserUtils.macros.parentDSValue, 'g')
class WhereItem {
  constructor (builder, item) {
    this.builder = builder
    this.condition = item.condition
    this.subQueryType = item.subQueryType
    this.isExternal = item.isExternal
    this.preparedExpressions = []

    if (parserUtils.deniedNotSimpleExpr && item.isExternal) {
      if (!parserUtils.extractExpressionProps(item.expression).simpleExpression) {
        // todo EMetabaseException
        throw new Error(`Invalid expression ${item.expression} from external call. In this mode server support only simple attribute expressions`)
      }
    }

    const parentBuilder = builder.parentBuilder

    if (parentBuilder && reParentDS.test(item.expression)) {
      // todo may be optimize
      const mainDSItem = parentBuilder.datasources.findFirstMainDSItem()
      if (mainDSItem) {
        const exprList = parserUtils.splitBracketExpressions(item.expression, false)
        for (let parseExpr of exprList) {
          if (reParentDS.test(parseExpr)) {
            const newExpr = parseExpr.replace(reParentDS, mainDSItem.uniqCalcShortName)
            item.expression = new RegExp(`[${parseExpr}]`, newExpr)
          }
        }
      }
      if (reParentDS.test(item.expression)) {
        item.expression = item.expression.replace(reParentDS, mainDSItem.uniqCalcShortName)
      }
    }

    let parseExpr = this._prepareSQLWhereItemExpressionText(item)
    if (parseExpr) {
      // if ((this.condition === 'Match') && (item.condition !== 'Match')) {
      //   this.condition = item.condition
      // }
      this.expression = builder.expressions.add({
        originalExpression: parseExpr,
        expressionList: this.preparedExpressions,
        attrExpression: parseExpr,
        lang: builder.lang,
        entity: builder.entity,
        level: parserUtils.rootLevel,
        manyAttrExprCollapsed: false,
        complexAttrExpression: parseExpr,
        whereItem: this,
        // parentJoin,
        registerInColumnList: true
      }).expression
      /*
       //Внимание! Построитель НЕ БУДЕТ поддерживать сложные условия, в которых участвуют "adtMany" атрибуты!
       //Проблема в том, что нужно переделать текст выражения с "Many" атрибутом, и построитель этого НЕ сможет сделать, если выражение сложное.
       //Поэтому с 23.11.2015 вводится ограничение на использование "Many" атрибутов в where-выражениях
       */
      if (this.preparedExpressions.haveManyDataType && (this.preparedExpressions.length > 0)) {
        if (this.preparedExpressions.length > 1) {
          // todo EMetabaseException
          throw new Error(`Complex expression for "Many" type attributes not supported: ${item.expression}`)
        }
        const {attrEntityName: manyAttrEntityName, attributeName: manyAttrName} = this.preparedExpressions[0]
        const manyAttr = App.domain_.get(manyAttrEntityName).attrs(manyAttrName)
        if (manyAttr.dataType === 'Many') {
          item.subQueryType = this._getSubQueryType()
          if (!item.subQueryType) {
            // todo EMetabaseException
            throw new Error('"Many" type attribute support only next conditions: "Equal", "In", "NotEqual", "NotIn", "IsNull", "NotIsNull"')
          }
          item.expression = ''
          item.condition = 'SubQuery'
          const whereItems = {
            cond1: {
              expression: `${parserUtils.serviceFields.sourceBr}=${parserUtils.macros.parentDSValue}.id`,
              condition: 'Custom'
            }
          }
          if (this._canAddClientConditions()) {
            whereItems.cond2 = {
              expression: parserUtils.serviceFields.destBr,
              condition: 'In',
              values: item.values
            }
          }
          item.values = {
            entityName: manyAttr.associationManyData,
            options: {limit: 1},
            whereList: new WhereList(builder, whereItems)
          }
          this.needRePrepare = true
          return
        }
      }
      let exprProps = parserUtils.extractExpressionProps(this.expression, {onlyOpenBracket: true})
      while (exprProps.existOpenBracket) {
        const {entity, level} = (this.preparedExpressions.length === 1) && (this.preparedExpressions[0].attrEntityName)
          ? {entity: App.domain_.get(this.preparedExpressions[0].attrEntityName), level: this.preparedExpressions[0].level}
          : {entity: builder.entity, level: parserUtils.rootLevel}
        this.expression = builder.expressions.add({
          originalExpression: this.expression,
          expressionList: this.preparedExpressions,
          attrExpression: this.expression,
          lang: builder.lang,
          entity,
          level,
          manyAttrExprCollapsed: false,
          complexAttrExpression: this.expression,
          whereItem: this,
          // parentJoin,
          registerInColumnList: false
        }).expression
        exprProps = parserUtils.extractExpressionProps(this.expression, {onlyOpenBracket: true})
      }
      this.params = item.values
    }
  }
  _prepareSQLWhereItemExpressionText (item) {
    // in childs
    return null
  }
  _getSubQueryType () {
    return null
  }
  _preparePositionParameterText () {
    // todo for oracle date casting
    return '?'
  }
  _canAddClientConditions () {
    return false
  }
}
class WhereItemSubQuery extends WhereItem {
  constructor (builder, item) {
    super(builder, item)
    if (builder.execType !== 'Select') {
      // todo EMetabaseException
      throw new Error(`Cannot use subquery in where item if main query NOT SELECT`)
    }
    const whereItemQueryEntity = App.domain_.get(item.values.entity)
    if (!whereItemQueryEntity) {
      // todo EMetabaseException
      throw new Error(`Entity "${item.values.entity}" not exist in Domain`)
    }
    this.subQueryBuilder = new builder.constructor({
      entity: whereItemQueryEntity,
      method: builder.method,
      fieldList: item.values.fieldList,
      execFieldList: item.values.execFieldList,
      fieldListType: item.values.fieldListType,
      execType: item.values.execType,
      whereList: item.values.whereList,
      logicalPredicates: item.values.logicalPredicates,
      joinAs: item.values.joinAs,
      orderByList: item.values.orderByList,
      groupByList: item.values.groupByList,
      options: item.values.options,
      parentBuilder: builder,
      isExternalCall: builder.isExternalCall
    })
    item.values.alsNeed = false
  }
  _prepareSQLWhereItemExpressionText (item) {
    return item.expression
  }
}
class WhereItemCustom extends WhereItem {
  _prepareSQLWhereItemExpressionText (item) {
    return item.expression
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
class WhereItemCompare extends WhereItem {
  _prepareSQLWhereItemExpressionText (item) {
    return `${item.expression}${conditionsCompare[item.condition]}${this._preparePositionParameterText()}'`
  }
}
class WhereItemEqual extends WhereItemCompare {
  _getSubQueryType () {
    return this.condition === 'Equal' ? 'Exists' : 'NotExists'
  }
  _canAddClientConditions () {
    return true
  }
}
class WhereItemBetween extends WhereItem {
  _prepareSQLWhereItemExpressionText (item) {
    const exprList = parserUtils.splitBracketExpressions(item.expression)
    switch (exprList) {
      // todo think about parameters format
      case 1:
        return `(${item.expression} BETWEEN ${this.preparePositionParameterText()} AND ${this.preparePositionParameterText()} )`
      case 2:
        return `(${this.preparePositionParameterText()} BETWEEN ${exprList[0].expression} AND ${exprList[1].expression} )`
      default:
        throw new Error(`Invalid expression "${item.expression}" for "between attributes" condition`)
    }
  }
}
class WhereItemIn extends WhereItem {
  _prepareSQLWhereItemExpressionText (item) {
    const valuesNames = Object.keys(item.values)
    const val = (valuesNames.length > 0) && item.values[valuesNames[0]]
    if (!val) {
      throw new Error('in or notIn condition must contain at least one value')
    }
    // todo check elements type
    if (!Array.isArray(val)) {
      throw new Error('in or not in parameter must be no empty string or integer array')
    }
    return `${item.expression} ${this.condition === 'In' ? 'IN' : 'NOT IN'} (${JSON.stringify(val)})`
  }
  _getSubQueryType () {
    return this.condition === 'In' ? 'Exists' : 'NotExists'
  }
  _canAddClientConditions () {
    return true
  }
}
class WhereItemNull extends WhereItem {
  _getSubQueryType () {
    return this.condition === 'IsNull' ? 'NotExists' : 'Exists'
  }
  _prepareSQLWhereItemExpressionText (item) {
    return `${item.expression} ${item.condition === 'IsNull' ? 'IS NULL' : 'IS NOT NULL'}`
  }
}
const conditionsLike = {
  Like: '',
  NotLike: 'NOT',
  StartWith: '',
  NotStartWith: 'NOT'
}
class WhereItemLike extends WhereItem {
  _prepareSQLWhereItemExpressionText (item) {
    // todo add % to begin or end of value if needed
    return `${item.expression} ${conditionsLike[item.condition]} ${this.builder.likePredicate} (?)`
  }
}
class WhereItemMatch extends WhereItem {
  _prepareSQLWhereItemExpressionText (item) {
    // todo
    return ``
  }
}
const whereItemClassesByCondition = {
  'Custom': WhereItemCustom,
  'Equal': WhereItemEqual,
  'NotEqual': WhereItemEqual,
  'More': WhereItemCompare,
  'MoreEqual': WhereItemCompare,
  'Less': WhereItemCompare,
  'LessEqual': WhereItemCompare,
  'Between': WhereItemBetween,
  'In': WhereItemIn,
  'NotIn': WhereItemIn,
  'SubQuery': WhereItemSubQuery,
  'IsNull': WhereItemNull,
  'NotIsNull': WhereItemNull,
  'Like': WhereItemLike,
  'NotLike': WhereItemLike,
  'StartWith': WhereItemLike,
  'NotStartWith': WhereItemLike,
  'Match': WhereItemMatch
}
const reLogicalPredicate = /\[([^\]]*)]/g
class LogicalPredicate {
  constructor (whereItems, expression) {
    this.expression = expression
    const knownPredicates = {}
    let predicateRes
    while (predicateRes = reLogicalPredicate.exec(expression)) {
      const predicateName = predicateRes[1]
      if (!knownPredicates[predicateName]) {
        const whereItem = whereItems[predicateName]
        if (whereItem) {
          if (whereItem.inJoinAsPredicate) {
            throw new Error(`Logical predicate with name "${predicateName}" already used in "joinAs" predicates`)
          }
          whereItem.inLogicalPredicate = true
          const re = new RegExp(`(\\[${predicateName}])`, 'g')
          this.expression = this.expression.replace(re, whereItem.expression, 'g')
        } else {
          throw new Error(`Condition ${predicateName} not found`)
        }
        knownPredicates[predicateName] = true
      }
    }
  }
}
class LogicalPredicateList {
  constructor (whereItems, logicalPredicates) {
    this.items = []
    for (let logicalPredicateExpression of logicalPredicates) {
      this.items.push(new LogicalPredicate(whereItems, logicalPredicateExpression))
    }
  }
}
class WhereList {
  constructor (builder, itemsList, logicalPredicates, joinAs) {
    this.builder = builder
// todo aPrepareContext.ProcessAlsData.Init;
    const itemNames = Object.keys(itemsList)
    this.items = {}

    for (let itemName of itemNames) {
      const item = itemsList[itemName]
      // const whereItem = this.items[itemName] = new WhereItem(item)
      this.items[itemName] = this._add(item)
    }
    if (joinAs) {
      for (let joinAsPredicate of joinAs) {
        this._addJoinAsPredicate(joinAsPredicate)
      }
    }
    if (logicalPredicates) {
      this.logicalPredicates = new LogicalPredicateList(this.items, logicalPredicates)
    }
  }
  _add (item) {
    let whereItem
    do {
      whereItem = new whereItemClassesByCondition[item.condition](this.builder, item)
    } while (whereItem.needRePrepare)
    return whereItem
  }
  _addJoinAsPredicate (expression) {
    // todo
  }
}
module.exports = WhereList