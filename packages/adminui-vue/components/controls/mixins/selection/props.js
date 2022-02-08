module.exports = {
  // for v-model
  model: {
    prop: 'selectedRows',
    event: 'selected'
  },
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
     * Field with which the selected item is matched. Default is "ID"
     */
    multiSelectKeyAttr: { type: String, default: 'ID' },
    /**
     * Controls the inclusion of multiline selection mode. Default is "false"
     */
    enableMultiSelect: { type: Boolean, default: false },
    /**
     * Hook what called before selecting an item. If returns false - selection will be canceled
     *
     * @argument {array<object>} addedCache an array that includes the objects (rows) that will be added to the selection
     */
    beforeAddSelection: {
      type: Function,
      default: () => true
    },
    /**
     * Hook what called before deselecting. If returns false - deselection will be canceled
     *
     * @argument {array<object>} removedCache an array that includes the objects (rows) that will be removed from the selection
     */
    beforeRemoveSelection: {
      type: Function,
      default: () => true
    }
  }
}
