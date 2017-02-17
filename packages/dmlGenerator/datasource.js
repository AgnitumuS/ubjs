/**
 * Created by v.orel on 20.01.2017.
 */
const dsNames = []
for (let i = 0; i < 1000; i++) {
  dsNames.push(`DS${i}`)
}

const enumEntity = 'ubm_enum'
const enumCodeAttr = 'code'
const enumGroupAttr = 'eGroup'
const idAttr = 'ID'
/**
 * Main data source for select query
 */
class DataSource {
  /**
   * @param {string} entity
   * @param {DataSource} parent
   */
  constructor (entity, parent) {
    /**
     * @class DataSource
     * @protected
     * @property {string} entityName
     */
    this.entityName = entity
    /**
     * @class DataSource
     * @public
     * @property {UBEntity} entity
     */
    this.entity = App.domainInfo.get(entity)
    /**
     * @class DataSource
     * @public
     * @property {DataSource} parent
     */
    this.parent = parent
    /**
     * @class DataSource
     * @public
     * @method getDSName
     * @returns string}
     */
    /**
     * @class DataSource
     * @public
     * @method getColumnIndex
     * @returns string}
     */
    if (parent) {
      this.getDSName = parent.getDSName
      this.getColumnIndex = parent.getColumnIndex
    } else {
      let iDS = 0
      this.getDSName = function () {
        return dsNames[iDS++]
      }
      let iCol = 0
      this.getColumnIndex = function () {
        return iCol++
      }
    }
    /**
     * @class DataSource
     * @public
     * @property {string} alias alias for SQL
     */
    this.alias = this.getDSName()
    /**
     * @class DataSource
     * @private
     * @property {Map.<UBEntityAttribute, JoinDS>} childDS Child items
     */
    this.childDS = new Map()
  }
  /**
   * SQL of the FROM-JOIN part
   * @returns {string}
   */
  get sql () {
    /**
     * @class DataSource
     * @protected
     * @property {string} _sql
     */
    if (!this._sql) {
      const res = [this.ownSQL]
      for (let child of this.childDS.values()) {
        res.push(child.sql)
      }
      this._sql = res.join(' ')
    }
    return this._sql
  }
  get ownSQL () {
    return ` FROM ${this.entity.name} AS ${this.alias}`
  }
  /**
   *
   * @param {UBEntityAttribute} attribute
   * @returns {JoinDS}
   */
  addChild (attribute) {
    let res = this.childDS.get(attribute)
    if (!res) {
      res = new JoinDS(attribute, this)
      this.childDS.set(attribute, res)
    }
    return res
  }
}

class JoinDS extends DataSource {
  /**
   *
   * @param {UBEntityAttribute} attribute
   * @param {DataSource} parent
   */
  constructor (attribute, parent) {
    const associatedEntityName = attribute.dataType === App.domainInfo.ubDataTypes.Enum ? enumEntity : attribute.associatedEntity
    if (!App.domainInfo.has(associatedEntityName)) {
      throw new Error(`Association entity in attribute "${attribute.name}" of object "${attribute.entity.name}" is empty`)
    }
    super(associatedEntityName, parent)
    /**
     * @class JoinDS
     * @public
     * @property {UBEntityAttribute} attribute
     */
    this.attribute = attribute
    /**
     * @class JoinDS
     * @public
     * @property {string} joinType
     */
    // todo
    this.joinType = 'INNER'
  }
  get ownSQL () {
    const associationAttr = this.attribute.dataType === App.domainInfo.ubDataTypes.Enum ? enumCodeAttr
      : (this.attribute.associationAttr || idAttr)
    return `${this.joinType} JOIN ${this.entityName} ${this.alias} ON ${this.alias}.${associationAttr}=${this.parent.alias}.${this.attribute.name}` +
      (this.attribute.enumGroup ? ` AND ${this.alias}.${enumGroupAttr}="${this.attribute.enumGroup}"` : '')
  }
}

module.exports = DataSource