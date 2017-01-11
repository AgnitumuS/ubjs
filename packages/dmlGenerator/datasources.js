/**
 * Created by v.orel on 11.01.2017.
 */
class JoinItem {
  constructor () {
    // todo
    this.a = 1
  }
  establishJoinType () {
    this.joinType = (!this.fromExprItem.AllowNull && !this.enumAdditionalToExprItem) ? 'INNER' : 'LEFT'
  }
}
class JoinList {
  constructor () {
    // todo
    this.items = []
  }
  add () {
    // todo
    this.items.push(new JoinItem())
  }
}
class DataSourceList {
  constructor () {
    this.items = []
  }
  getItem (dsData, level) {
    // todo
    // todo if not added set visible from dsData
    return {
      item: {
        uniqCalcShortName: '',
        joinList: new JoinList()
      },
      added: false
    }
  }
}

module.exports = DataSourceList