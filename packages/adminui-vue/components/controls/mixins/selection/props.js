module.exports = {
  props: {
    selectedRows: { type: Array, default: () => [] },
    selectionField: { type: String, default: 'ID' },
    multiple: { type: Boolean, default: false }
  }
}
