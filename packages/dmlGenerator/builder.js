/**
 * Created by v.orel on 11.01.2017.
 */
const ColumnList = require('./column')
const ExpressionList = require('./expression')
const DataSourceList = require('./datasource')
const WhereList = require('./where')
const OrderByList = require('./orderBy')
const GroupByList = require('./groupBy')

class CustomSQLBuilder {
  constructor ({entity, method, fieldList, execFieldList, fieldListType, execType, whereList, logicalPredicates, joinAs, orderByList, groupByList, options, parentBuilder, isExternalCall = true}) {
    this.entity = App.domain_.get(entity)
    // this.dialect = entity.connectionConfig.dialect
    this.method = method
    this.options = options || {}
    this.execType = execType
    this.execparams = {}
    this.isExternalCall = isExternalCall
    this.parentBuilder = parentBuilder
    this.params = parentBuilder ? parentBuilder.params : {}
    this.expressions = new ExpressionList(this)
    this.datasources = new DataSourceList(this)
    this.isDataSourceCusomSQL = this._isDataSourceCusomSQL(this.entity)

    if (options.start < 0) {
      // todo EMetabaseException
      throw new Error('Parameter "options.start" value is invalid')
    }
    if (options.limit < 0) {
      // todo EMetabaseException
      throw new Error('Parameter "options.start" value is invalid')
    }

    let doFieldList = this.isDataSourceCusomSQL && (fieldListType === 'exec' ? execFieldList : fieldList)
    // todo ProcessAlsData
    //   aPrepareContext.ProcessAlsData.InitBy(aSQL.alsNeed, aSQL.alsCurrState, aSQL.alsCurrRoles);

    if (doFieldList) {
      this.lang = this.builder === 'insert' ? App.defaultLang : Session.userLang || App.defaultLang
      this.columns = new ColumnList(this, doFieldList)
    }
    // whereList
    if (!this.isDataSourceCusomSQL && whereList && (whereList.length > 0)) {
      this.whereList = new WhereList(this, whereList, logicalPredicates, joinAs)
    }
    // orderBy items
    if (orderByList) {
      this.orderByList = new OrderByList(this, orderByList)
    }
    // groupBy items
    if (groupByList) {
      this.groupByList = new GroupByList(this, groupByList)
    }
  }
  get dialect () {
    return ['AnsiSQL']
  }
  _isDataSourceCusomSQL (entity) {
    const mapping = entity.mapping
    return !!(mapping && mapping.customSQL)
  }
  getManyExpressionType () {
    return 'Field'
  }
  getManyExpression () {
    return ''
  }
  buildSelectQuery () {
    return this.buildBaseSelectQuery()
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
  getJoinText (stageIsWhere) {
    return 'CustomSQLBuilder cannot generate join SQL expression'
  }
}

module.exports = CustomSQLBuilder