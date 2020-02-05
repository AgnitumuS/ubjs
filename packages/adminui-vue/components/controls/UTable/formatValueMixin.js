const lookups = require('@unitybase/adminui-vue/utils/lookups')

module.exports = {
  methods: {
    formatValue ({ value, column, row }) {
      if (typeof column.format === 'function') {
        return column.format({ value, column, row })
      } else {
        const entity = column.attribute && column.attribute.associatedEntity
        return entity
          ? lookups.getValueById(entity, value)
          : value
      }
    }
  }
}
