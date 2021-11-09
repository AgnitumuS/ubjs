const UB = require('@unitybase/ub-pub')
const defaultType = require('./type-definitions/default')
const defaultCellTemplate = require('./cell-templates/default.vue').default

/**
 * @typedef {object} ColumnDefinition
 * @property {object} settings
 * @property {Vue.Component} template
 * @property {object<string, UTableColumnFilter>} filters
 */

/**
 * Module provides column settings, cell and filter templates by UB data types or by the `customSettings.columnType` value.
 * Different types can have same templates or settings.
 *
 * Entity attributes with dataType `Text`, `BLOB`, `TimeLog` did not have default render component,
 * If you need to render this dataTypeProvider render it by named column slots.
 * You need to decide to display this column type with great caution because this column can creates large server requests.
 */
const ColumnDefProvider = {
  /** @type {object<string, ColumnDefinition>} */
  _types: {},

  /**
   * Register new type
   *
   * @param {string} type Type from UBDomain.ubDataTypeProvider
   * @param {UTableColumnSettings} settings Column settings
   * @param {Vue.Component} [cellTemplate] Cell template
   * @param {object<string, UTableColumnFilter>} [filters={}] Filters templates
   */
  registerColumnDefinition ({ type, settings, cellTemplate = defaultCellTemplate, filters = {} }) {
    this._types[type] = {
      settings: { ...settings },
      template: cellTemplate,
      filters
    }
  },

  /**
   * Get column definition by an attribute definition
   * @param {object} [attribute]
   * @returns {ColumnDefinition}
   */
  getDefinitionByColumnAttr (attribute) {
    const columnType = attribute?.customSettings?.columnType
    const byColumnType = this._types[columnType]
    if (byColumnType) {
      return byColumnType
    }
    const dataType = attribute?.dataType
    return this._types[dataType] ?? { ...defaultType }
  }
}

ColumnDefProvider.registerColumnDefinition({
  type: 'String',
  settings: require('./type-definitions/string'),
  filters: {
    startWith: {
      label: 'startWith',
      template: require('./filter-templates/string/startWith.vue').default
    },
    equal: {
      label: 'equal',
      template: require('./filter-templates/string/equal.vue').default
    },
    contains: {
      label: 'contains',
      template: require('./filter-templates/string/contains.vue').default
    },
    isNull: {
      label: 'isNull',
      template: require('./filter-templates/string/isNull.vue').default
    }
  }
})

ColumnDefProvider.registerColumnDefinition({
  type: 'Json',
  settings: require('./type-definitions/string')
})

ColumnDefProvider.registerColumnDefinition({
  type: 'Boolean',
  settings: require('./type-definitions/boolean'),
  filters: {
    isTrue: {
      label: 'Yes',
      template: require('./filter-templates/boolean/isTrue.vue').default
    },
    isFalse: {
      label: 'No',
      template: require('./filter-templates/boolean/isFalse.vue').default
    },
    isNull: {
      label: 'isNull',
      template: require('./filter-templates/boolean/isNull.vue').default
    }
  }
})

ColumnDefProvider.registerColumnDefinition({
  type: 'Entity',
  settings: require('./type-definitions/entity'),
  filters: {
    equal: {
      label: 'equal',
      template: require('./filter-templates/entity/equal.vue').default
    },
    oneOf: {
      label: 'by_several_value',
      template: require('./filter-templates/entity/oneOf.vue').default
    },
    isNull: {
      label: 'isNull',
      template: require('./filter-templates/entity/isNull.vue').default
    },
    notEqual: {
      label: 'notEqual',
      template: require('./filter-templates/entity/notEqual.vue').default
    },
    notContains: {
      label: 'notContains',
      template: require('./filter-templates/entity/notContains.vue').default
    }
  }
})

ColumnDefProvider.registerColumnDefinition({
  type: 'Many',
  settings: require('./type-definitions/many'),
  filters: {
    oneOf: {
      label: 'by_several_value',
      template: require('./filter-templates/many/oneOf.vue').default
    },
    isNull: {
      label: 'isNull',
      template: require('./filter-templates/many/isNull.vue').default
    }
  }
})

ColumnDefProvider.registerColumnDefinition({
  type: 'Enum',
  settings: require('./type-definitions/enum'),
  filters: {
    equal: {
      label: 'equal',
      template: require('./filter-templates/enum/equal.vue').default
    },
    oneOf: {
      label: 'by_several_value',
      template: require('./filter-templates/enum/oneOf.vue').default
    },
    isNull: {
      label: 'isNull',
      template: require('./filter-templates/enum/isNull.vue').default
    },
    notEqual: {
      label: 'notEqual',
      template: require('./filter-templates/enum/notEqual.vue').default
    },
    notContains: {
      label: 'notContains',
      template: require('./filter-templates/enum/notContains.vue').default
    }
  }
})

const dateFilters = {
  range: {
    label: 'range',
    template: require('./filter-templates/date/range.vue').default
  },
  fromDate: {
    label: 'from_date',
    template: require('./filter-templates/date/fromDate.vue').default
  },
  onDate: {
    label: 'date',
    template: require('./filter-templates/date/onDate.vue').default
  },
  toDate: {
    label: 'to_date',
    template: require('./filter-templates/date/toDate.vue').default
  },
  isNull: {
    label: 'isNull',
    template: require('./filter-templates/date/isNull.vue').default
  }
}

ColumnDefProvider.registerColumnDefinition({
  type: 'Date',
  settings: {
    minWidth: 120,
    sortable: true,
    format ({ value }) {
      return UB.formatter.formatDate(value, 'date')
    }
  },
  filters: dateFilters
})

ColumnDefProvider.registerColumnDefinition({
  type: 'DateTime',
  settings: {
    minWidth: 190, // en: 05/23/2020, 1:14 PM
    sortable: true,
    format ({ value }) {
      return UB.formatter.formatDate(value, 'dateTime')
    }
  },
  filters: dateFilters
})

const numberFilter = {
  equal: {
    label: 'equal',
    template: require('./filter-templates/number/equal.vue').default
  },
  more: {
    label: 'more',
    template: require('./filter-templates/number/more.vue').default
  },
  less: {
    label: 'less',
    template: require('./filter-templates/number/less.vue').default
  },
  range: {
    label: 'range',
    template: require('./filter-templates/number/range.vue').default
  },
  isNull: {
    label: 'isNull',
    template: require('./filter-templates/number/isNull.vue').default
  }
}

ColumnDefProvider.registerColumnDefinition({
  type: 'ID',
  settings: require('./type-definitions/id'),
  filters: numberFilter
})

const NUMBER_SETTINGS = require('./type-definitions/number')
ColumnDefProvider.registerColumnDefinition({
  type: 'BigInt',
  settings: NUMBER_SETTINGS,
  filters: numberFilter
})

ColumnDefProvider.registerColumnDefinition({
  type: 'Currency',
  settings: {
    ...NUMBER_SETTINGS,
    format: ({ value }) => {
      return UB.formatter.formatNumber(value, 'sum')
    }
  },
  filters: numberFilter
})

ColumnDefProvider.registerColumnDefinition({
  type: 'Float',
  settings: NUMBER_SETTINGS,
  filters: numberFilter
})

ColumnDefProvider.registerColumnDefinition({
  type: 'Int',
  settings: NUMBER_SETTINGS,
  filters: numberFilter
})

ColumnDefProvider.registerColumnDefinition({
  type: 'Document',
  settings: {
    sortable: false
  },
  cellTemplate: require('./cell-templates/document.vue').default
})

ColumnDefProvider.registerColumnDefinition({
  type: 'Text',
  settings: require('./type-definitions/string'),
  cellTemplate: renderWarning('Text')
})

ColumnDefProvider.registerColumnDefinition({
  type: 'BLOB',
  settings: require('./type-definitions/string'),
  cellTemplate: renderWarning('BLOB')
})

ColumnDefProvider.registerColumnDefinition({
  type: 'TimeLog',
  settings: require('./type-definitions/string'),
  cellTemplate: renderWarning('TimeLog')
})

function renderWarning (type) {
  return () => {
    console.warn(`By default don't have renderer for type "${type}". You need to decide to display this column type with great caution because this column can creates large server requests`)
  }
}

module.exports = ColumnDefProvider
