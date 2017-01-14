/**
 * Created by v.orel on 14.01.2017.
 */
class GroupByList {
  constructor (builder) {
    this.builder = builder
    this.items = []
  }
  add (item) {
    // todo
    this.items.push(item)
  }
}
module.exports = GroupByList