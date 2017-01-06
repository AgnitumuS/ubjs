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
const reOneBracketField = /^\[(.*)]$/
class Field {
  /**
   * @param {CustomSQLBuilder} builder
   * @param {String} fieldExpr
   * @param {Boolean} notHandleNonBracket
   * @param {Boolean} withAlias
   */
  constructor (builder, fieldExpr, notHandleNonBracket = true, withAlias = false) {
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
const reBracketField = /\[([^\]]*)]/g
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
    this.where = {}

    for (let condition in whereList) {
      const whereItem = whereList[condition]
      this.where[condition] = this.addWhereItem(whereItem)
    }

    if (joinAs) {
      for (let joinAsPredicate of joinAs) {
        this.addJoinAsPredicate(joinAsPredicate)
      }
    }

    this.logicalPredicates = []
    if (logicalPredicates) {
      for (let logicalPredicate of logicalPredicates) {
        this.logicalPredicates.push(new LogicalPredicate(logicalPredicate))
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
    // todo assign where and whereAddCond
    let isFirstWhere = true

    for (let condition in this.where) {
      const whereItem = this.where[condition]
      if (!whereItem.inLogicalPredicate && !whereItem.inJoinAsPredicate) {
        if (isFirstWhere) {
          parts.push(' WHERE ')
        } else {
          parts.push(' AND ')
        }
        parts.push(whereItem.expression)
      }
    }

    for (let logicalPredicate of this.logicalPredicates) {
      if (isFirstWhere) {
        parts.push(' WHERE ')
      } else {
        parts.push(' AND ')
      }
      parts.push(logicalPredicate.expression)
    }

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
   * @returns {Field}
   */
  addFieldItem (fieldExpr, notHandleNonBracket = true, withAlias = false) {
    return new Field(this, fieldExpr, notHandleNonBracket, withAlias)
  }
  /**
   * @param {String} expression
   * @param {String} condition
   * @param {Object} values
   * @returns {WhereItem}
   */
  addWhereItem ({expression, condition, values}) {
    switch (condition) {
      case 'Custom':
      case 'SubQuery':
        return new WhereItemCustom(expression)
      case 'Equal':
      case 'NotEqual':
      case 'More':
      case 'MoreEqual':
      case 'Less':
      case 'LessEqual':
        return new WhereItemCompare(this, {expression, condition, values})
      case 'Between':
        return new WhereItemBetween(this, {expression, values})
      case 'In':
      case 'NotIn':
        return new WhereItemIn(this, {expression, condition, values})
      case 'IsNull':
      case 'NotIsNull':
        return new WhereItemNull(this, {expression, condition, values})
      case 'Like':
      case 'NotLike':
      case 'StartWith':
      case 'NotStartWith':
        return new WhereItemLike(this, {expression, condition, values})
      case 'Match':
        return new WhereItemMatch({expression, condition, values})
      default:
        throw new Error(`Unknown condition: ${condition}`)
    }
  }
  addJoinAsPredicate (expression) {
    const whereItem = this.where[expression]
    if (whereItem) {
      whereItem.inJoinAsPredicate = true
      if (whereItem.field && whereItem.field.ds) {
        whereItem.field.ds.where.push(whereItem)
      }
    }
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

