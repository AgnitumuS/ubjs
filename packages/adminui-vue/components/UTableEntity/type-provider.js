const defaultType = require('./type-definitions/default.js')

/**
 * Module provides column settings, cell and filter templates by UB data types.
 * Different types can have same templates or settings.
 *
 * Entity attributes with dataType `Text`, `BLOB`, `TimeLog` did not have default render component,
 * If you need to render this dataTypes render it by named column slots.
 * You need to decide to display this column type with great caution because this column can creates large server requests.
 */
const Types = {
  _types: {},

  /**
   * Register type
   *
   * @param {string} type Type from UBDomain.ubDataTypes
   * @param {UTableColumnSettings} settings Column settings
   * @param {function:Vue} [cellTemplate] Cell template
   * @param {function:Vue} [filterTemplate] Filter template
   */
  registerType ({ type, settings, cellTemplate, filterTemplate }) {
    this._types[type] = Object.assign(
      {},
      settings,
      {
        ...(
          cellTemplate
            ? { template: () => cellTemplate }
            : {}
        ),
        filterTemplate: () => filterTemplate
      }
    )
  },

  /**
   * Get column definition
   *
   * @param {UBDomain.ubDataTypes} type Type from UBDomain.ubDataTypes
   */
  get (type) {
    if (this._types[type]) {
      return this._types[type]
    } else {
      return Object.assign({}, defaultType)
    }
  }
}

Types.registerType({
  type: 'String',
  settings: require('./type-definitions/string.js'),
  filterTemplate: require('./filter-templates/string.vue').default
})
Types.registerType({
  type: 'Json',
  settings: require('./type-definitions/string.js')
})
Types.registerType({
  type: 'ID',
  settings: require('./type-definitions/id.js'),
  filterTemplate: require('./filter-templates/id.vue').default
})
Types.registerType({
  type: 'Boolean',
  settings: require('./type-definitions/boolean.js'),
  cellTemplate: require('./cell-templates/boolean.vue').default,
  filterTemplate: require('./filter-templates/boolean.vue').default
})
Types.registerType({
  type: 'Entity',
  settings: require('./type-definitions/entity.js'),
  cellTemplate: require('./cell-templates/entity.vue').default,
  filterTemplate: require('./filter-templates/entity.vue').default
})
Types.registerType({
  type: 'Many',
  settings: require('./type-definitions/many.js'),
  cellTemplate: require('./cell-templates/many.vue').default,
  filterTemplate: require('./filter-templates/many.vue').default
})
Types.registerType({
  type: 'Enum',
  settings: require('./type-definitions/enum.js'),
  cellTemplate: require('./cell-templates/enum.vue').default,
  filterTemplate: require('./filter-templates/enum.vue').default
})
Types.registerType({
  type: 'Date',
  settings: require('./type-definitions/date.js'),
  cellTemplate: require('./cell-templates/date.vue').default,
  filterTemplate: require('./filter-templates/date.vue').default
})
Types.registerType({
  type: 'DateTime',
  settings: require('./type-definitions/date.js'),
  cellTemplate: require('./cell-templates/date-time.vue').default,
  filterTemplate: require('./filter-templates/date.vue').default
})
Types.registerType({
  type: 'BigInt',
  settings: require('./type-definitions/number.js'),
  filterTemplate: require('./filter-templates/number.vue').default
})
Types.registerType({
  type: 'Currency',
  settings: require('./type-definitions/number.js'),
  filterTemplate: require('./filter-templates/number.vue').default
})
Types.registerType({
  type: 'Float',
  settings: require('./type-definitions/number.js'),
  filterTemplate: require('./filter-templates/number.vue').default
})
Types.registerType({
  type: 'Int',
  settings: require('./type-definitions/number.js'),
  filterTemplate: require('./filter-templates/number.vue').default
})
Types.registerType({
  type: 'Document',
  settings: require('./type-definitions/document.js'),
  cellTemplate: require('./cell-templates/document.vue').default
})
Types.registerType({
  type: 'Text',
  settings: require('./type-definitions/string.js'),
  cellTemplate: renderWarning('Text')
})
Types.registerType({
  type: 'BLOB',
  settings: require('./type-definitions/string.js'),
  cellTemplate: renderWarning('BLOB')
})
Types.registerType({
  type: 'TimeLog',
  settings: require('./type-definitions/string.js'),
  cellTemplate: renderWarning('TimeLog')
})

function renderWarning (type) {
  return () => {
    console.warn(`By default don't have renderer for type "${type}". You need to decide to display this column type with great caution because this column can creates large server requests`)
  }
}

module.exports = Types
