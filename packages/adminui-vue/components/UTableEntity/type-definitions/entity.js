const Lookups = require('../../../utils/lookups')

/**
 * @type {UTableColumnSettings}
 */
module.exports = {
  isLookup: true,
  sortable: true,
  format ({ value, column }) {
    if (column.isLookup) {
      return Lookups.getValueById(column.attribute.associatedEntity, value)
    } else {
      return value
    }
  }
}
