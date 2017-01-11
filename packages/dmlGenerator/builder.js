/**
 * Created by v.orel on 11.01.2017.
 */
const ColumnList = require('./columns')
const ExpressionList = require('./expressions')
const DataSourceList = require('./datasources')
class CustomSQLBuilder {
  constructor ({entity, method, fieldList, execFieldList, fieldListType, execType, whereList, logicalPredicates, joinAs, options, isExternalCall = true}) {
    this.entity = App.domain_.get(entity)
    // this.dialect = entity.connectionConfig.dialect
    this.method = method
    this.langAttributeList = {}
    this.options = options || {}
    this.isExternalCall = isExternalCall
    this.columns = new ColumnList(this)
    this.expressions = new ExpressionList(this)
    this.datasources = new DataSourceList(this)
    if (options.start < 0) {
      // todo EMetabaseException
      throw new Error('Parameter "options.start" value is invalid')
    }
    if (options.limit < 0) {
      // todo EMetabaseException
      throw new Error('Parameter "options.start" value is invalid')
    }
    const isDataSourceCusomSQL = this.isDataSourceCusomSQL(this.entity)
    let doFieldList
    if (!isDataSourceCusomSQL) {
      if (fieldListType === 'exec') {
        doFieldList = execFieldList
      } else {
        doFieldList = fieldList
      }
    }
    // todo
    //   aPrepareContext.ProcessAlsData.InitBy(aSQL.alsNeed, aSQL.alsCurrState, aSQL.alsCurrRoles);

    if (doFieldList) {
      if (execType === 'insert') {
        this.userLang = App.defaultLang
      } else {
        this.userLang = Session.userLang ? Session.userLang : App.defaultLang
      }
      for (let fieldItem of doFieldList) {
        this.columns.add(fieldItem, false)
      }
    }

/*    this.fields = []
    this.fieldsAliases = {}
//    this.expressions = new ExpressionList(this)
//    this.datasources = new DataSources(this)

    // todo handle start, limit

    // todo handle custom sql
    // todo handle execFieldList
    // todo handle als ???
    // todo handle insert
    // todo handle multilang

    for (let fieldExpr of fieldList) {
      //this.fields.push(this.addFieldItem(fieldExpr, false, true))
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
*/
  }
  get dialect () {
    return ['AnsiSQL']
  }
  isDataSourceCusomSQL (entity) {
    const mapping = entity.mapping
    return !!(mapping && mapping.customSQL)
  }
  getManyExpressionType () {
    return 'Field'
  }
  getManyExpression () {
    return ''
  }
  prepareSQLColumn () {
    return 1
  }
}

module.exports = CustomSQLBuilder