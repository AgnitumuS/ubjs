/**
 * Created by v.orel on 11.01.2017.
 */
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

class JoinItem {
  constructor (builder, joinFromItem, joinToExprItem, joinToDSItem, associatedEntity, enumJoinToExprItem, enumGroup) {
    this.joinFromItem = joinFromItem
    this.joinToExprItem = joinToExprItem
    this.joinToDSItem = joinToDSItem
    this.associatedEntity = associatedEntity
    this.enumJoinToExprItem = enumJoinToExprItem
    this.enumGroup = enumGroup

    this.whereItems = new Set()
    this.builder = builder
    this.getJoinText = builder.getJoinText
  }
  establishJoinType () {
    this.joinType = (!this.joinFromItem.AllowNull && !this.enumJoinToExprItem) ? 'INNER' : 'LEFT'
  }
  getSQL () {
    const res = [this.getJoinText()]
    if (this.enumJoinToExprItem) {
      res.push(`AND ${this.enumJoinToExprItem.sqlExpression}="this.enumGroup"`)
    }
    for (let whereItem of this.whereItems) {
      if (whereItem.inJoinAsPredicate) {
        res.push(`AND ${whereItem.getSQL()}`)
      }
    }
    return res
  }
}
class JoinList {
  constructor (dataSource) {
    this.dataSource = dataSource
    this.structuredItems = new Map() // of Map of map of JoinItem
    this.items = []
  }
  add ({joinFromItem, joinToExprItem, joinToDSItem, associatedEntity, enumJoinToExprItem, enumGroup, whereItem, isLastJoin}) {
    if (joinFromItem && joinToExprItem && joinToDSItem) {
      let ds = this.structuredItems.get(joinToDSItem)
      if (!ds) {
        ds = new Map()
        this.structuredItems.set(joinToDSItem, ds)
      }
      let fromItem = ds.get(joinFromItem)
      if (!fromItem) {
        fromItem = new Map()
        ds.set(joinFromItem, fromItem)
      }
      let item = ds.get(joinToExprItem)
      if (!item) {
        item = new JoinItem(this.datasource.builder, joinFromItem, joinToExprItem, joinToDSItem, associatedEntity, enumJoinToExprItem, enumGroup)
        this.items.push(item)
        ds.set(joinToExprItem, item)
      }
      if (isLastJoin) {
        item.whereItems.add(whereItem)
      }
      return item
    }
  }
  getSQL () {
    const res = []
    for (let item of this.items) {
      res.concat(item.getSql())
    }
    return res
  }
}
const shortNames = []
for (let i = 'A'.charCodeAt(0); i <= 'Z'.charCodeAt(0); i++) {
  shortNames.push(`DS${String.fromCharCode(i)}`)
}
for (let i = 0; i < 1000; i++) {
  shortNames.push(`DS${i}`)
}
const friendlySqlAliases = process.isDebug
class DataSource {
  constructor (dsList, dsData, level) {
    this.builder = dsList.builder
    if (friendlySqlAliases) {
      this.shortName = dsList.shortNames[dsData.selectName]
      if (!this.shortName) {
        if (dsData.proposedSelectShortName && !dsList.registeredShortNames.includes(dsData.proposedSelectShortName)) {
          this.shortName = dsData.proposedSelectShortName
        } else {
          for (let shortName of shortNames) {
            if (dsList.registeredShortNames.includes(shortName)) {
              this.shortName = shortName
              break
            }
          }
        }
      }
      this.uniqCalcShortName = this.shortName
      let i = 2
      while (dsList.forbiddenAlias.includes(this.uniqCalcShortName)) {
        this.forbiddenAlias.push(this.uniqCalcShortName = `${this.shortName}${i++}`)
      }
    } else {
      this.uniqCalcShortName = `A${builder.aliasCounter.counter}`
    }
    this.ownerEntityName = dsData.ownerEntityName
    this.selectName = dsData.selectName
    this.execName = dsData.execName
    this.visible = dsData.visible
    this.joinList = new JoinList()
    // todo is level parameter needed
    this.level = level
  }
}
class DataSourceList {
  constructor (builder) {
    this.builder = builder
    this.items = {}
    this.shortNames = {}
    this.registeredShortNames = []
    this.getJoinText = builder.getJoinText
    if (friendlySqlAliases) {
      this.forbiddenAlias = builder.parentBuilder ? builder.parentBuilder.datasources.forbiddenAlias : []
    } else {
      this.aliasCounter = builder.parentBuilder ? builder.parentBuilder.datasources.aliasCounter : new AliasCounter()
    }
  }
  getItem (dsData, level) {
    const levelItem = (this.items[level]) || (this.items[level] = {})
    let added = false
    const item = (levelItem[dsData.selectName]) || ((added = true) && (levelItem[dsData.selectName] = new DataSource(this, dsData, level)))
    if (!added) {
      item.visible = item.visible || dsData.visible
    } else if (!this.mainDsItem) {
      this.mainDsItem = item
    }
    return {item, added}
  }
  getSQL () {
    const res = []
    const itemNames = Object.keys(this.items)
    for (let itemName of itemNames) {
      const item = this.items[itemName]
      if (item.visible) {
        if (res.length === 0) {
          res.push(`${item.selectName} ${item.uniqCalcShortName}`)
        }
        res.concat(item.joinList.getSQL())
      }
    }
    return res.join(' ')
  }
}

module.exports = DataSourceList