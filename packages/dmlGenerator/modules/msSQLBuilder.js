/**
 * Created by v.orel on 05.01.2017.
 */
const CustomSQLBuilder = require('./CustomSQLBuilder')
class MSSQLBuilder extends CustomSQLBuilder {
  buildSelectQuery() {
    if (!this.options.start && !this.options.limit) {
      /*
       SELECT A.a, A.b
       FROM myTable A
       WHERE A.a > 1
       GROUP BY A.a
       ORDER BY A.a
       */
      return this.buildBaseSelectQuery()
    } else {
      // Query WITH paging
      // and WITHOUT start
      if (!this.options.start) {
        /*
         SELECT TOP 5 A.a, A.b
         FROM myTable A
         WHERE A.a > 1
         GROUP BY A.a
         ORDER BY A.a
         */
        this.fieldsPrefix = 'TOP' + this.options.limit
        return this.buildBaseSelectQuery()
      } else {
        // WITH start
        // if WITHOUT sorting, need to add custom sorting by ID
        switch (this.dialect) {
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
            if (this.orderList.length === 0) {
              if (this.idColumn) {
                this.fieldsSuffix = `, ROW_NUMBER() OVER (ORDER BY ${this.idColumn.expression} AS ubRowNumber`
              } else {
                throw new Error('Error on build select SQL: income fields must have "ID" attribute for paging on MSSQL')
              }
            } else {
              this.fieldsSuffix = ', ROW_NUMBER() OVER (ORDER BY ' + this.orderby + ') AS ubRowNumber'
              this.orderby = ''
            }
            return [
              'SELECT * FROM (',
              this.buildBaseSelectQuery(),
              `) AS x WHERE x.ubRowNumber > ${this.options.start} AND x.ubRowNumber <= ${this.options.start + this.options.limit}`
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

module.exports = MSSQLBuilder