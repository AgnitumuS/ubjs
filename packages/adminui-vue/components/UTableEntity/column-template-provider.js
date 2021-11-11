const UB = require('@unitybase/ub-pub')
const defaultType = require('./type-definitions/default')
const defaultCellTemplate = require('./cell-templates/default.vue').default

/**
 * @typedef {object} ColumnDefinition
 *
 * @property {object} settings
 * @property {Vue.Component} template
 * @property {object<string, UTableColumnFilter>} filters
 */

/**
 * Module provides column settings, cell tempplate and filter templates by UB data types or by the `customSettings.columnTemplate` value.
 * Different types can have same templates or settings.
 *
 * Entity attributes with dataType `Text`, `BLOB`, `TimeLog` did not have default render component,
 * If you need to render this dataTypeProvider render it by named column slots.
 * You need to decide to display this column type with great caution because this column can creates large server requests.
 */
const ColumnTemplateProvider = {
  /** @type {object<string, ColumnDefinition>} */
  _types: {},

  /**
   * Register new template
   *
   * @param {string} type Type from UBDomain.ubDataTypeProvider
   * @param {UTableColumnSettings} settings Column settings
   * @param {Vue.Component} [cellTemplate] Cell template
   * @param {object<string, UTableColumnFilter>} [filters={}] Filters templates
   */
  registerTemplate ({ type, settings, cellTemplate = defaultCellTemplate, filters = {} }) {
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
  getByColumnAttribute (attribute) {
    const columnTemplate = attribute?.customSettings?.columnTemplate
    const byAttrSettings = this._types[columnTemplate]
    if (byAttrSettings) {
      return byAttrSettings
    }
    const dataType = attribute?.dataType
    return this._types[dataType] ?? { ...defaultType }
  }
}

ColumnTemplateProvider.registerTemplate({
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

ColumnTemplateProvider.registerTemplate({
  type: 'Json',
  settings: require('./type-definitions/string')
})

ColumnTemplateProvider.registerTemplate({
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

ColumnTemplateProvider.registerTemplate({
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

ColumnTemplateProvider.registerTemplate({
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

ColumnTemplateProvider.registerTemplate({
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

ColumnTemplateProvider.registerTemplate({
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

ColumnTemplateProvider.registerTemplate({
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

ColumnTemplateProvider.registerTemplate({
  type: 'ID',
  settings: require('./type-definitions/id'),
  filters: numberFilter
})

const NUMBER_SETTINGS = require('./type-definitions/number')
ColumnTemplateProvider.registerTemplate({
  type: 'BigInt',
  settings: NUMBER_SETTINGS,
  filters: numberFilter
})

ColumnTemplateProvider.registerTemplate({
  type: 'Currency',
  settings: {
    ...NUMBER_SETTINGS,
    format: ({ value }) => {
      return UB.formatter.formatNumber(value, 'sum')
    }
  },
  filters: numberFilter
})

ColumnTemplateProvider.registerTemplate({
  type: 'Float',
  settings: NUMBER_SETTINGS,
  filters: numberFilter
})

ColumnTemplateProvider.registerTemplate({
  type: 'Int',
  settings: NUMBER_SETTINGS,
  filters: numberFilter
})

ColumnTemplateProvider.registerTemplate({
  type: 'Document',
  settings: {
    sortable: false
  },
  cellTemplate: require('./cell-templates/document.vue').default
})

ColumnTemplateProvider.registerTemplate({
  type: 'Text',
  settings: require('./type-definitions/string'),
  cellTemplate: renderWarning('Text')
})

ColumnTemplateProvider.registerTemplate({
  type: 'BLOB',
  settings: require('./type-definitions/string'),
  cellTemplate: renderWarning('BLOB')
})

ColumnTemplateProvider.registerTemplate({
  type: 'TimeLog',
  settings: require('./type-definitions/string'),
  cellTemplate: renderWarning('TimeLog')
})

function renderWarning (type) {
  return () => {
    console.warn(`By default don't have renderer for type "${type}". You need to decide to display this column type with great caution because this column can creates large server requests`)
  }
}

module.exports = ColumnTemplateProvider
