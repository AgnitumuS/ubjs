/**
 * Created by v.orel on 11.01.2017.
 */
const ColumnList = require('./column')
const ExpressionList = require('./expression')
const DataSourceList = require('./datasource')
const WhereList = require('./where')
const OrderByList = require('./orderBy')
const GroupByList = require('./groupBy')

class AliasCounter {
  constructor () {
    this._counter = 1
  }
  get counter () {
    if (this._counter < 100) {
      return this._counter++
    } else {
      throw new Error('Too many table in query')
    }
  }
}

class CustomSQLBuilder {
  constructor ({entity, method, fieldList, execFieldList, fieldListType, execType, whereList, logicalPredicates, joinAs, orderByList, groupByList, options, parentBuilder, isExternalCall = true}) {
    this.entity = App.domain_.get(entity)
    // this.dialect = entity.connectionConfig.dialect
    this.method = method
    this.options = options || {}
    this.isExternalCall = isExternalCall
    this.expressions = new ExpressionList(this)
    this.datasources = new DataSourceList(this)
    this.orderByList = new OrderByList(this)
    this.groupByList = new GroupByList(this)
    this.execType = execType
    this.execparams = {}
    this.friendlySqlAliases = process.isDebug
    this.isDataSourceCusomSQL = this._isDataSourceCusomSQL(this.entity)
    this.parentBuilder = parentBuilder
    if (!this.friendlySqlAliases) {
      this.aliasCounter = parentBuilder ? parentBuilder.aliasCounter : new AliasCounter()
    } else {
      this.forbiddenAlias = parentBuilder ? parentBuilder.forbiddenAlias : []
      // todo ForbiddenAlias
    }
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
    // todo move to "orderBy" module
    for (let item in orderByList) {
      this.orderByList.add(item)
    }
    // groupBy items
    // todo move to "groupBy" module
    for (let item in groupByList) {
      this.groupByList.add(item)
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
}

module.exports = CustomSQLBuilder