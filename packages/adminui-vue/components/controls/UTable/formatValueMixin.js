module.exports = {
  methods: {
    formatValue ({ value, column, row }) {
      if (typeof column.format === 'function') {
        return column.format({ value, column, row })
      } else {
        return value
      }
    }
  }
}
