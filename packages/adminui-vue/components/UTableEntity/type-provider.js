const defaultType = require('./type-definitions/default')
const defaultCellTemplate = require('./cell-templates/default.vue').default

/**
 * Module provides column settings, cell and filter templates by UB data types.
 * Different types can have same templates or settings.
 *
 * Entity attributes with dataType `Text`, `BLOB`, `TimeLog` did not have default render component,
 * If you need to render this dataTypeProvider render it by named column slots.
 * You need to decide to display this column type with great caution because this column can creates large server requests.
 */
const TypeProvider = {
  _types: {},

  /**
   * Register type
   *
   * @param {string} type Type from UBDomain.ubDataTypeProvider
   * @param {UTableColumnSettings} settings Column settings
   * @param {Vue.Component} [cellTemplate] Cell template
   * @param {Vue.Component} [filterTemplate] Filter template
   */
  registerType ({ type, settings, cellTemplate: template = defaultCellTemplate, filterTemplate }) {
    this._types[type] = {
      definition: { ...settings },
      template,
      filterTemplate
    }
  },

  /**
   * Get column definition
   *
   * @param {UBDomain.ubDataTypes} type Type from UBDomain.ubDataTypeProvider
   */
  get (type) {
    if (this._types[type]) {
      return this._types[type]
    } else {
      return Object.assign({}, defaultType)
    }
  }
}

TypeProvider.registerType({
  type: 'String',
  settings: require('./type-definitions/string'),
  filterTemplate: require('./filter-templates/string.vue').default
})
TypeProvider.registerType({
  type: 'Json',
  settings: require('./type-definitions/string')
})
TypeProvider.registerType({
  type: 'ID',
  settings: require('./type-definitions/id'),
  filterTemplate: require('./filter-templates/id.vue').default
})
TypeProvider.registerType({
  type: 'Boolean',
  settings: require('./type-definitions/boolean'),
  filterTemplate: require('./filter-templates/boolean.vue').default
})
TypeProvider.registerType({
  type: 'Entity',
  settings: require('./type-definitions/entity'),
  filterTemplate: require('./filter-templates/entity.vue').default
})
TypeProvider.registerType({
  type: 'Many',
  settings: require('./type-definitions/many'),
  filterTemplate: require('./filter-templates/many.vue').default
})
TypeProvider.registerType({
  type: 'Enum',
  settings: require('./type-definitions/enum'),
  filterTemplate: require('./filter-templates/enum.vue').default
})
TypeProvider.registerType({
  type: 'Date',
  settings: require('./type-definitions/date'),
  filterTemplate: require('./filter-templates/date.vue').default
})
TypeProvider.registerType({
  type: 'DateTime',
  settings: require('./type-definitions/date-time'),
  filterTemplate: require('./filter-templates/date.vue').default
})
TypeProvider.registerType({
  type: 'BigInt',
  settings: require('./type-definitions/number'),
  filterTemplate: require('./filter-templates/number.vue').default
})
TypeProvider.registerType({
  type: 'Currency',
  settings: require('./type-definitions/number'),
  filterTemplate: require('./filter-templates/number.vue').default
})
TypeProvider.registerType({
  type: 'Float',
  settings: require('./type-definitions/number'),
  filterTemplate: require('./filter-templates/number.vue').default
})
TypeProvider.registerType({
  type: 'Int',
  settings: require('./type-definitions/number'),
  filterTemplate: require('./filter-templates/number.vue').default
})
TypeProvider.registerType({
  type: 'Document',
  settings: require('./type-definitions/document'),
  cellTemplate: require('./cell-templates/document.vue').default
})
TypeProvider.registerType({
  type: 'Text',
  settings: require('./type-definitions/string'),
  cellTemplate: renderWarning('Text')
})
TypeProvider.registerType({
  type: 'BLOB',
  settings: require('./type-definitions/string'),
  cellTemplate: renderWarning('BLOB')
})
TypeProvider.registerType({
  type: 'TimeLog',
  settings: require('./type-definitions/string'),
  cellTemplate: renderWarning('TimeLog')
})

function renderWarning (type) {
  return () => {
    console.warn(`By default don't have renderer for type "${type}". You need to decide to display this column type with great caution because this column can creates large server requests`)
  }
}

module.exports = TypeProvider
