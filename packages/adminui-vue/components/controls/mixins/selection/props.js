module.exports = {
  props: {
    selectedRows: {
      type: Array,
      default: () => [],
      validator (arr) {
        if (arr.length === 0) return true
        const flag = arr.some(i => {
          const type = typeof i
          return type !== 'number' || type !== 'string'
        })
        if (flag === true) {
          console.error(
            ' %c Item on selectedRows array must be number or string',
            'color: #bada55'
          )
        }
        return !flag
      }
    },
    selectionField: { type: String, default: 'ID' },
    multiple: { type: Boolean, default: false }
  }
}
