/**
 * Created by v.orel on 11.01.2017.
 */
const ColumnList = require('./columns')
const ExpressionList = require('./expressions')
const DataSourceList = require('./datasources')
const WhereList = require('./where')

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
    this.whereList = new WhereList(this)
    this.execType = execType
    this.execparams = {}
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

// ***** start block
// todo move this block to ColumnList constructor
    if (doFieldList) {
      if (this.execType === 'insert') {
        this.lang = App.defaultLang
      } else {
        this.lang = Session.userLang ? Session.userLang : App.defaultLang
      }
      for (let fieldItem of doFieldList) {
        // todo is external
        this.columns.add(fieldItem, false)
      }
      // For update operation deny use the same attr with and without lang pointer "[name]" and "[name^]" in the same time
      if (this.execType === 'update') {
        for (let langAttrName in this.langAttributeList) {
          const langAttrForUpdate = this.langAttributeList[langAttrName]
          if (langAttrForUpdate.existLangPointer && langAttrForUpdate.noLangPointer) {
            // todo EMetabaseException
            throw new Error(`Invalid using lang pointer in attribute "${langAttrForUpdate.attributeName}" for update operation`)
          }
        }
      }
    }
    if ((this.execType === 'insert') && !isDataSourceCusomSQL) {
      const storedLang = this.lang
      for (let langAttrName in this.langAttributeList) {
        const langAttrForInsert = this.langAttributeList[langAttrName]
        for (let lang of this.entity.connectionConfig.supportLang) {
          if (lang !== this.lang) {
            if (langAttrForInsert.lang.includes(lang)) {
              this.lang = lang
              const column = this.columns.add(langAttrForInsert.attributeName, false)
              this.lang = storedLang
              if ((Object.keys(langAttrForInsert.defaultLangValues).length > 0) && (column.PreparedExpressions.length > 0)) {
                this.execParams[column.PreparedExpressions[0].nonPrefixSQLExpression] = langAttrForInsert.defaultLangValues[Object.keys(langAttrForInsert.defaultLangValues)[0]]
              }
            }
          }
        }
      }
    }
// **** end block
    // whereList
    if (!isDataSourceCusomSQL && whereList && (whereList.length > 0)) {
// todo aPrepareContext.ProcessAlsData.Init;
      let i = 0
      const l = whereList.length
      let needRePrepare = false
      let whereItem
      while (i < l) {
        const item = whereList[i]
        if (!needRePrepare) {
          whereItem = this.whereList.add(item)
        }
        needRePrepare = false
        // todo const
        if ((whereItem.name !== 'logicalPredicates') || (whereItem.name !== 'joinAs')) {
          if (whereItem.condition === 'Select') {
            if (execType !== 'Select') {
              // todo EMetabaseException
              throw new Error(`Cannot use subquery in where item if main query NOT SELECT`)
            }
            whereItem.createSubQueryBuilder(this.entity)
            // todo
            const whereItemQueryEntity = App.domain_.get(whereItem.query.entityName)
            if (!whereItemQueryEntity) {
              // todo EMetabaseException
              throw new Error(`Entity "${whereItem.query.entityName}" not exist in Domain`)
            }
            // todo
            whereItem.query.alsNeed = false
/* todo
           {$IFDEF FRIENDLYSQLALIAS}
           DSList.PrepareInForbiddenAlias(fBldWhereItem.fSubQueryBuilder.DSList.inForbiddenAlias);
           {$ENDIF}
           {$IFNDEF FRIENDLYSQLALIAS}
           fBldWhereItem.fSubQueryBuilder.AliasCounter := AliasCounter;
           {$ENDIF}
           {$IFDEF FRIENDLYSQLALIAS}
           DSList.PrepareInForbiddenAlias(fBldWhereItem.fSubQueryBuilder.DSList.inForbiddenAlias);
           {$ENDIF}
           {$IFNDEF FRIENDLYSQLALIAS}
           fBldWhereItem.fSubQueryBuilder.AliasCounter := AliasCounter;
           {$ENDIF}
           fBldWhereItem.fSubQueryBuilder.PrepareQuery(aPrepareContext, fWhereItemQueryEntity, fSQLWhereItem.query, Self);
           {$IFDEF FRIENDLYSQLALIAS}
           fBldWhereItem.fSubQueryBuilder.DSList.PrepareOutForbiddenAlias;
           DSList.IncAllForbiddenAlias(fBldWhereItem.fSubQueryBuilder.DSList.outForbiddenAlias);
           {$ENDIF}
           {$IFNDEF FRIENDLYSQLALIAS}
           AliasCounter := fBldWhereItem.fSubQueryBuilder.AliasCounter;
           {$ENDIF}
 */
          }
          // todo move to "where" modele
          needRePrepare = this._prepareSQLWhereItem(item, whereItem)
        }
        if (!needRePrepare) {
          i++
        }
      }
      // todo handle logicalPredicates and joinAsPredicates
    }
    // todo orderBy items
    // todo пкщгзBy items
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
  _prepareSQLWhereItem (item, whereItem) {
    // todo move in
    return false
  }
}

module.exports = CustomSQLBuilder