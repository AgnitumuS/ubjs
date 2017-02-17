/**
 * Created by v.orel on 20.01.2017.
 */
/**
 * @typedef {string[]} ubqlFieldList
 */
/**
 * @class ubqlWhere
 * @property {string} expression
 * @property {string} condition
 * @property {*} value
 * @property {*} values
 */
/**
 * @typedef {Object.<string, string>} ubqlOrder
 */
/**
 * @class ubqlOptions
 * @property {number} start
 * @property {number} limit
 */
/**
 * @class ubqlSelect
 * @property {ubqlFieldList} fieldList
 * @property {Object.<string, ubqlWhere>} whereList
 * @property {string[]} logicalPredicates
 * @property {string[]} joinAs
 * @property {ubqlOrder[]} orderBy
 * @property {string[]} groupBy
 * @property {ubqlOptions} options
 */
const DataSource = require('./datasource')
const ColumnList = require('./column')
const WhereList = require('./where')

class SqlBuilder {
  /**
   * Build SQL for select and returns it's parameters
   * @param {string} entity
   * @param {ubqlSelect} ubql
   * @param {boolean} isExternal
   * @returns {{sql: string, params: Array}}
   */
  static biuldSelectSql (entity, ubql, isExternal) {
    const params = []
    const dataSource = new DataSource(entity)
    const {fieldList, whereList} = ubql
    const columns = new ColumnList(fieldList, dataSource, isExternal)
    const where = new WhereList(whereList, dataSource, isExternal, params)

    return {sql: columns.sql + dataSource.sql + where.sql, params: params}
  }
}
module.exports = SqlBuilder

// todo link attribute documentation [a1.a2.a3@e1.a4.a5@e2.a6.a7] => e2(e1(a1.a2).a3.a4).a5.a6.a7