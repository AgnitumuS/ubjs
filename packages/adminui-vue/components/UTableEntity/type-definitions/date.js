const moment = require('moment')

/**
 * @type {UTableColumnSettings}
 */
module.exports = {
  minWidth: 180,
  sortable: true,
  format ({ value }) {
    if (value instanceof Date) {
      return moment(value).format('ll')
    } else {
      return value
    }
  }
}
