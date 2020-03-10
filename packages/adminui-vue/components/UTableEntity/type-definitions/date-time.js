const moment = require('moment')

/**
 * @type {UTableColumnSettings}
 */
module.exports = {
  minWidth: 220,
  sortable: true,
  format ({ value }) {
    if (value instanceof Date) {
      return moment(value).format('lll')
    } else {
      return value
    }
  }
}
