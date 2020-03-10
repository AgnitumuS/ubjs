const Lookups = require('../../../utils/lookups')

/**
 * @type {UTableColumnSettings}
 */
module.exports = {
  isLookup: true,
  sortable: true,
  format ({ value, column }) {
    if (column.isLookup && value !== null) {
      return Lookups.getEnumValue(column.attribute.enumGroup, value)
    } else {
      return value
    }
  }
}
