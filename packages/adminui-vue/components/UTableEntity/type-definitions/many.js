const lookups = require('../../../utils/lookups')

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
          const entity = column.attribute.associatedEntity
          const associatedAttr = column.attribute.associatedAttr || 'ID'
          const lookupQuery = {
            [associatedAttr]: id
          }
          return lookups.get(entity, lookupQuery)
        })
        .join(', ')
    } else {
      return value
    }
  }
}
