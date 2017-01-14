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
    // todo FRIENDLYSQLALIAS forbiden aliases
    // todo if not added set visible from dsData
    const joinList = new JoinList()
    const item = {
      uniqCalcShortName: '',
      joinList: joinList
    }
    this.items.push(item)
    return {item, added: true}
  }
  findFirstMainDSItem () {
    return this.items.lenhth > 0 ? this.items[0] : null
  }
  prepareInForbiddenAlias (inForbiddenAlias) {
    // todo
    return inForbiddenAlias
  }
  prepareOutForbiddenAlias () {
    // todo
    return {}
  }
  incAllForbiddenAlias (aliases) {
    // todo
    return {}
  }
}

module.exports = DataSourceList