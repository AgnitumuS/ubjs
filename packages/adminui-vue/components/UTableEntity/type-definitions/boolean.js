/**
 * @type {UTableColumnSettings}
 */
module.exports = {
  sortable: true,
  align: 'center',
  isHtml: true,
  format ({ value }) {
    switch (value) {
      case true:
        return '<i class="u-icon-check"/>'
      case false:
      default:
        return null
    }
  },
  exportFormat ({ value }) {
    return value
  }
}
