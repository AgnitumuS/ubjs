const Lookups = require('../../../utils/lookups')

/**
 * @type {UTableColumnSettings}
 */
module.exports = {
  isLookup: true,
  format ({ value, column }) {
    if (column.isLookup && value) {
      return value.toString()
        .split(',')
        .map(id => {
          return Lookups.getValueById(column.attribute.associatedEntity, Number(id))
        })
        .join(', ')
    } else {
      return value
    }
  }
}
