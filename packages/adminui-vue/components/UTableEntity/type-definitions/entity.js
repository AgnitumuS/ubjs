const lookups = require('../../../utils/lookups')

/**
 * @type {UTableColumnSettings}
 */
module.exports = {
  isLookup: true,
  sortable: true,
  format ({ value, column }) {
    if (column.isLookup) {
      const entity = column.attribute.associatedEntity
      const associatedAttr = column.attribute.associatedAttr || 'ID'
      const lookupQuery = {
        [associatedAttr]: value
      }
      return lookups.get(entity, lookupQuery)
    } else {
      return value
    }
  }
}
