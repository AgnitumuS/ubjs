module.exports = {
  props: {
    /**
     * array which consists of primitive fields from table items. Default is empty
     */
    selectedRows: {
      type: Array,
      default: () => [],
      validator (arr) {
        if (arr.length === 0) return true
        const flag = arr.some(i => {
          const type = typeof i
          const check = type === 'number' || type === 'string'
          return !check
        })
        if (flag) {
          console.error(
            ' %c Item on selectedRows array must be a number or a string',
            'color: #bada55'
          )
        }
        return !flag
      }
    },
    /**
     * the field with which the selected item is matched. Default is "ID"
     */
    multiSelectKeyAttr: { type: String, default: 'ID' },
    /**
     * controls the inclusion of multiline selection mode. Default is "false"
     */
    enableMultiSelect: { type: Boolean, default: false }
  }
}
