/**
 * Created by v.orel on 29.12.2016.
 */
// /**
// * @class WhereItem
// * todo
// */
// /**
// * @class OrderItem
// * todo
// */
// /**
// * @class Options
// * todo
// */
// /**
// * @class SQL
// * @property {String} __description
// * @property {Boolean} __mip_disablecache
// * @property {Boolean} distinct
// * @property {Boolean} alsNeed
// * @property {String} __alsCurrState
// * @property {String} __alsCurrRoles
// * @property {String} entity
// * @property {Array<String>} fieldList
// * @property {Array<WhereItem>} whereList
// * @property {Array<String>} logicalPredicates
// * @property {Array<String>} joinAs
// * @property {Array<OrderItem>} orderList
// * @property {Array<String>} groupList
// * @property {Options} options
// * @property {Object} execParams
// */
const UB_ID = 'ID'
const UB_BRACKET_ID = '[ID]'
const reBracktField = /^\[(.*)]$/
const conditions = {
  Custom: '',
  Equal: '=',
  NotEqual: '<>',
  More: '>',
  MoreEqual: '>=',
  Less: '<',
  LessEqual: '<=',
  sqlecIn: '?',
  sqlecNotIn: '?',
  sqlecIsNull: '?',
  sqlecNotIsNull: '?',
  sqlecLike: '?',
  sqlecNotLike: '?',
  sqlecStartWith: '?',
  sqlecNotStartWith: '?',
  sqlecMatch: '?',
  sqlecSubQuery: '?',
  sqlecBetween: '?'
}

class SQL {
  constructor ({entity, method, fieldList, whereList}) {
    this.entity = App.domain_.get(entity)
    this.method = method
    this._fields = []
    this.knownDS = {}
    this.fieldsAliases = {}
    this.datasources = [this.entity.code + ' ' + this.entity.sqlAlias]

    // todo handle start, limit
    // todo handle custom sql
    // todo handle execFieldList
    // todo handle als ???
    // todo handle insert
    // todo handle multilang
    this.options = {}
    for (let fieldExpr of fieldList) {
      this._fields.push(this.addField(fieldExpr, false, true))
      // todo handle for update disable using [name] and [name^]
    }
    // todo handle insert multilang
    // todo whereList
    this.where = ''
    for (let condition in whereList) {
      const whereItem = whereList[condition]
      this.addWhereItem(whereItem)
    }
  }
  addFieldInternal (fieldExpr, withAlias = false) {
    const fieldParts = fieldExpr.split('.')
    let curEntity = this.entity
    let curAttr = ''
    let ds = {
      alias: this.entity.sqlAlias
    }
    for (let i = 0; i < fieldParts.length - 1; i++) {
      const part = fieldParts[i]
      const attr = curEntity.attributes[part]
      curEntity = attr.getAssociatedEntity()
      if (curEntity) {
        const prevDS = ds
        curAttr = curAttr ? curAttr + '.' + part : part
        const alias = curEntity.sqlAlias
        let curAlias = alias
        ds = this.knownDS[curAlias]
        let i = 1
        while (ds && (ds.attribute !== curAttr)) {
          curAlias = alias + ++i
          ds = this.knownDS[curAlias]
        }
        if (!ds) {
          ds = this.knownDS[curAlias] = {
            attribute: curAttr,
            alias: curAlias,
            allowNull: attr.allowNull || prevDS.allowNull
          }
          this.datasources.push(` ${ds.allowNull ? 'LEFT JOIN' : 'INNER JOIN'} ${curEntity.code} ${ds.alias} ON ${ds.alias}.ID=${prevDS.alias}.${attr.code}`)
        }
      } else {
        throw new Error(`Association entity in attribute "${part}" of object "${curEntity}" is empty`)
      }
    }
    const fieldName = fieldParts[fieldParts.length - 1]
    let i = 1
    let alias = fieldName
    if (withAlias) {
      while (this.fieldsAliases[alias]) {
        alias = fieldName + ++i
      }
      this.fieldsAliases[alias] = 1
    }
    return `${ds.alias}.${alias === fieldName ? fieldName : fieldName + ' AS ' + alias}`
  }
  addField (fieldExpr, notHandleNonBracket = true, withAlias = false) {
    // todo handle *
    if ((fieldExpr === UB_ID) || (fieldExpr === UB_BRACKET_ID)) {
      this.idColumn = this
    }
    // todo disable complex expressions in external call
    if (reBracktField.test(fieldExpr)) {
      // const fieldParts = reBracktField.exec(fieldExpr)[1].split('.')
      return this.addFieldInternal(reBracktField.exec(fieldExpr)[1], withAlias)
    } else {
      if (notHandleNonBracket) {
        return fieldExpr
      }
      return this.addFieldInternal(fieldExpr, withAlias)
      //

      /*
      if (this.datasources.length === 0) {
        this.datasources.push(this.entity.code + ' ' + this.entity.sqlAlias)
      }
      */
      // return this.entity.sqlAlias + '.' + fieldExpr
    }
  }
  addWhereItem ({expression, condition, values}) {
    switch (condition) {
      case 'Custom':
        this.where += expression
        break
      case 'Equal':
      case 'NotEqual':
      case 'More':
      case 'MoreEqual':
      case 'Less':
      case 'LessEqual':
        this.where += this.addWhereItemCompare({expression, condition, values})
        break
      case 'Between':
        this.where += this.addWhereItemBetween({expression, condition, values})
        break
    }
  }
  preparePositionParameterText () {
    return '?'
  }
  addWhereItemCompare ({expression, condition, values}) {
    return `${this.addField(expression)}${conditions[condition]}${this.preparePositionParameterText()}'`
  }
  addWhereItemBetween ({expression, condition, values}) {
    /*
    get expressions count
    1 - expr between ? and ?
    2 - ? between expr1 and expr 2
     */
//    return `${this.addField(expression)}${conditions[condition]}${this.preparePositionParameterText()}'`
  }
  get fields () {
    return this._fields
  }
}

class CustomSQLBuilder {
  /**
   * @property {Object} options
   * @property {Array} orderList
   * @property {Array} columnList
   */
  constructor () {
    this.options = {}
    this.orderList = []
    this.columnList = []
    this.columnList.idColumn = ''
  }
  /**
   * Prepare select parts
   * @param {SQL} sql
   */
  /* prepareSelectParts (sql) {
    const fields = []
    for (let i = 0; i < params.fieldList.length; i++) {
      // todo *
      // todo custom expressions
      fields.push(params.fieldList[i])
    }
    const datasources = []
    datasources.push(params.entity)
    // todo join
    // todo where
    return {fields: fields.join(','), datasources: datasources.join('')}
  } */

  /**
   * buildBaseSelectQuery
   * @param {SQL} sql
   * @returns {string}
   */
  buildBaseSelectQuery (sql) {
    const parts = ['SELECT ']
    if (sql.fieldsPrefix) {
      parts.push(sql.fieldsPrefix)
      parts.push(' ')
    }

    if (!sql.fields) {
      parts.push('null')
    } else {
      parts.push(sql.fields)
    }
    if (sql.fieldsSuffix) {
      parts.push(sql.fieldsSuffix)
    }
    parts.push(' FROM ')
    parts.push.apply(parts, sql.datasources)
    // todo assign where and whereAddCond
    if (sql.where || sql.whereAddCond) {
      parts.push(' WHERE ')
      if (sql.where) {
        parts.push(sql.where)
      }
      if (sql.whereAddCond) {
        if (sql.where) {
          parts.push(' AND ')
        }
        parts.push(sql.whereAddCond)
      }
    }
    // todo assign where and groupby
    if (sql.groupby) {
      parts.push(' GROUP BY ')
      parts.push(sql.groupby)
    }
    // todo assign where and orderby
    if (sql.orderby) {
      parts.push(' ORDER BY ')
      parts.push(sql.orderby)
    }
    return parts.join('')
  }
  buildSelectQuery (database, params, hint, useCR, indentLevel) {
    return ''
  }

}

class ANSISQLBuilder extends CustomSQLBuilder {
}

class MSSQLBuilder extends ANSISQLBuilder {
  buildSelectQuery (params) {
    const sql = new SQL(params)
    // const selectParts = this.prepareSelectParts(sql)
    if (!sql.options.start && !sql.options.limit) {
        /*
        SELECT A.a, A.b
        FROM myTable A
        WHERE A.a > 1
        GROUP BY A.a
        ORDER BY A.a
        */
      return this.buildBaseSelectQuery(sql)
    } else {
      // Query WITH paging
      // and WITHOUT start
      if (!sql.options.start) {
          /*
          SELECT TOP 5 A.a, A.b
          FROM myTable A
          WHERE A.a > 1
          GROUP BY A.a
          ORDER BY A.a
          */
        sql.fieldsPrefix = 'TOP' + this.options.limit
        return this.buildBaseSelectQuery(sql)
      } else {
        // WITH start
        // if WITHOUT sorting, need to add custom sorting by ID
        switch (sql.dialect) {
          case 'sqldMSSQL2008':
            /*
            SELECT * FROM (
              SELECT A.a, A.b, ROW_NUMBER() OVER (ORDER BY A.a) AS ubRowNumber
              FROM myTable A
              WHERE A.a > 1
              GROUP BY A.a
              -- ORDER BY A.a Warning! 'Order by' not here
            ) AS x
            WHERE x.ubRowNumber > start AND x.ubRowNumber <= start + limit
            */
            if (sql.orderList.length === 0) {
              if (sql.columnList.idColumn) {
                sql.fieldsSuffix = `, ROW_NUMBER() OVER (ORDER BY ${sql.columnList.idColumn.expression} AS ubRowNumber`
              } else {
                throw new Error('Error on build select SQL: income fields must have "ID" attribute for paging on MSSQL')
              }
            } else {
              sql.fieldsSuffix = ', ROW_NUMBER() OVER (ORDER BY ' + sql.orderby + ') AS ubRowNumber'
              sql.orderby = ''
            }
            return [
              'SELECT * FROM (',
              this.buildBaseSelectQuery(sql),
              `) AS x WHERE x.ubRowNumber > ${sql.options.start} AND x.ubRowNumber <= ${sql.options.start + sql.options.limit}`
            ].join('')
          case 'sqldMSSQL2012':
            /*
             SELECT A.a, A.b
             FROM myTable A
             WHERE A.a > 1
             GROUP BY A.a
             ORDER BY A.a
             OFFSET start ROWS FETCH NEXT limit ROWS ONLY
            */
            if (sql.orderList.length === 0) {
              if (sql.columnList.idColumn) {
                sql.orderby = this.columnList.idColumn.expression
              } else {
                throw new Error('Error on build select SQL: income fields must have "ID" attribute for paging on MSSQL')
              }
            }
            return [
              this.buildBaseSelectQuery(sql),
              ` OFFSET ${sql.options.start} ROWS FETCH NEXT ${sql.options.limit} ROWS ONLY`
            ].join('')
        }
      }
    }
    return ''
  }
}

exports.MSSQLBuilder = MSSQLBuilder