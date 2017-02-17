/**
 * Created by v.orel on 16.02.2017.
 */
const CustomItem = require('./customItem')
class WhereItem extends CustomItem {
  /**
   *
   * @param {ubqlWhere} ubqlWhereItem
   * @param {DataSource} dataSource
   */
  constructor (ubqlWhereItem, dataSource) {
    super(ubqlWhereItem.expression, dataSource)
    this.condition = ubqlWhereItem.condition
    // todo replace {master} macros
  }
  _preparePositionParameterText () {
    // todo for oracle date casting
    return '?'
  }
}
class WhereItemSubQuery extends WhereItem {
  // todo
  get sql () {
    return this.expression
  }
}
class WhereItemCustom extends WhereItem {
  get sql () {
    return this.expression
  }
}
const conditionsCompare = {
  equal: '=',
  notequal: '<>',
  more: '>',
  moreequal: '>=',
  less: '<',
  lessequal: '<='
}
class WhereItemCompare extends WhereItem {
  get sql () {
    return `${this.expression}${conditionsCompare[this.condition]}${this._preparePositionParameterText()}`
  }
}
class WhereItemEqual extends WhereItemCompare {

}
class WhereItemIn extends WhereItem {
  get sql () {
    const valuesNames = Object.keys(this.values)
    const val = (valuesNames.length > 0) && this.values[valuesNames[0]]
    if (!val) {
      throw new Error('in or notIn condition must contain at least one value')
    }
    // todo check elements type
    if (!Array.isArray(val)) {
      throw new Error('in or not in parameter must be no empty string or integer array')
    }
    return `${this.expression} ${this.condition === 'in' ? 'IN' : 'NOT IN'} (${JSON.stringify(val)})`
  }
}
class WhereItemNull extends WhereItem {
  get sql () {
    return `${this.expression} ${this.condition === 'isnull' ? 'IS NULL' : 'IS NOT NULL'}`
  }
}
const conditionsLike = {
  like: '',
  notlike: 'NOT',
  startwith: '',
  notstartwith: 'NOT'
}
class WhereItemLike extends WhereItem {
  get sql () {
    // todo add % to begin or end of value if needed
    return `${this.expression} ${conditionsLike[this.condition]} ${'LIKE'} (?)`
  }
}
class WhereItemMatch extends WhereItem {
  // todo
}
const whereItemClassesByCondition = {
  'custom': WhereItemCustom,
  'equal': WhereItemEqual,
  'notequal': WhereItemEqual,
  'more': WhereItemCompare,
  'moreequal': WhereItemCompare,
  'less': WhereItemCompare,
  'lesslqual': WhereItemCompare,
  // 'between': WhereItemBetween,
  'in': WhereItemIn,
  'notin': WhereItemIn,
  'subquery': WhereItemSubQuery,
  'isnull': WhereItemNull,
  'notisnull': WhereItemNull,
  'like': WhereItemLike,
  'notlike': WhereItemLike,
  'startwith': WhereItemLike,
  'notstartwith': WhereItemLike,
  'match': WhereItemMatch
}
class WhereList {
  /**
   *
   * @param {Object.<string, ubqlWhere>} whereList
   * @param {DataSource} dataSource
   * @param {boolean} isExternal
   * @param {Array} params
   */
  constructor (whereList, dataSource, isExternal, params) {
    const itemNames = Object.keys(whereList)
    this.items = new Map()
    for (let itemName of itemNames) {
      const item = whereList[itemName]
      // const whereItem = this.items[itemName] = new WhereItem(item)
      this.items.set(itemName,
        new whereItemClassesByCondition[item.condition.toLowerCase()](item, dataSource, params)
      )
    }
  }
  get sql () {
    const res = []
    for (let [, item] of this.items) {
      // todo may be resolve by class
      if (item.expression && (item.condition !== 'subquery') && !item.inLogicalPredicate && !item.inJoinAsPredicate) {
        res.push(item.sql)
      }
    }
    this.logicalPredicates && res.push.apply(res, this.logicalPredicates.getSQL())
    return (res.length > 0) ? ` WHERE ${res.join(' AND ')}` : ''
  }
}
module.exports = WhereList