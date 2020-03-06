const UB = require('@unitybase/ub-pub')

/**
 * @type {UTableColumnSettings}
 */
module.exports = {
  sortable: true,
  format ({ value }) {
    switch (value) {
      case true:
        return UB.i18n('Yes')
      case false:
        return UB.i18n('No')
      default:
        return null
    }
  }
}
