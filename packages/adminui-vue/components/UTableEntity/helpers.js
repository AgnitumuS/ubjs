const UB = require('@unitybase/ub-pub')
const types = require('./type-provider.js')

/**
 * @typedef {object} UTableColumnSettings
 *
 * @property {boolean} [sortable=false] Adds sortable icon which emits sort action on click
 * @property {boolean} [isLookup=false] If is set true will check attribute associatedEntity and loads description attribute for displayed value
 * @property {'left'|'right'|'center'} [align='left'] Align text in column
 * @property {'left'|'right'|'center'} [headerAlign='left'] Align text in column header
 * @property {number} [maxWidth] Maximum width
 * @property {number} [minWidth] Minimum width
 * @property {number} [width] Width
 * @property {boolean} [isHtml=false] If set true will render content as v-html directive
 * @property {function} [format] Format displayed value in cell. Will ignored if is set custom slot.
 */

/**
 * @typedef {UTableColumnSettings} UTableColumn
 *
 * @property {string} id Unique column property name
 * @property {string} label Column label which shows in header cells
 * @property {UBEntityAttribute} attribute Meta attribute info from UB entity schema
 */

/**
 * @typedef {object} UTablePropsDefaults
 *
 * @property {function:ClientRepository} repository Function which returns UB.ClientRepository
 * @property {string} entityName Entity name
 * @property {number} pageSize Page size
 * @property {array<UTableColumn>} columns Columns definitions
 * @property {string} dateFormat Moment.js date format for columns with type "Date"
 * @property {string} dateTimeFormat Moment.js date format for columns with type "DateTime"
 */

const formatValueMixin = {
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
module.exports = {
  buildProps,
  formatValueMixin
}

/**
 * Get default values for props beforeCreate vue instance
 *
 * @param {object} propsData Vue.propsData
 * @returns {UTablePropsDefaults} Props
 */
function buildProps (propsData) {
  const props = {}
  if (propsData.repository) {
    props.repository = propsData.repository
    props.entityName = propsData.repository().entityName
  } else if (propsData.entityName) {
    props.repository = () => UB.Repository(propsData.entityName)
      .attrs(
        UB.connection.domain.get(propsData.entityName).getAttributeNames()
      )
    props.entityName = propsData.entityName
  } else {
    throw new Error(`<UTableEntity> Required property "entityName" or "repository" is unset`)
  }

  if (propsData.columns) {
    props.columns = propsData.columns.map(column => {
      if (typeof column === 'string') {
        return buildColumn(column, props.entityName)
      } else {
        return {
          ...buildColumn(column.id, props.entityName),
          ...column
        }
      }
    })
  } else {
    props.columns = UB.connection.domain.get(props.entityName)
      .filterAttribute(a => a.defaultView)
      .map(({ code }) => buildColumn(code, props.entityName))
  }

  props.pageSize = propsData.pageSize || UB.connection.appConfig.storeDefaultPageSize

  props.dateFormat = propsData.dateFormat || 'll'
  props.dateTimeFormat = propsData.dateTimeFormat || 'lll'

  const buildConfigDefault = config => config
  props.buildCopyConfig = propsData.buildCopyConfig || buildConfigDefault
  props.buildEditConfig = propsData.buildEditConfig || buildConfigDefault
  props.buildAddNewConfig = propsData.buildAddNewConfig || buildConfigDefault

  return props
}

/**
 * Build column generate label and default settings for current attribute dataType
 *
 * @param {string} columnId
 * @param {string} rootEntityName
 * @returns {UTableColumn}
 */
function buildColumn (columnId, rootEntityName) {
  const { penult, last } = metaAttributesList(columnId, rootEntityName)
  const dataType = last && last.dataType
  const columnDef = types.get(dataType)
  let label
  if (penult) {
    label = UB.i18n(`${penult.entity.code}.${penult.code}`) || columnId
  } else {
    label = columnId
  }

  return {
    id: columnId,
    label,
    attribute: last,
    ...columnDef
  }
}

/**
 * Get last and penult attribute of path.
 * If path have just one attribute last and panult will be have same values.
 * It need in case when path have nesting, and need to get dataType of penultimate attribute but label from last.
 *
 * @param {string} path Property
 * @param {string} rootEntityName Entity name
 * @returns {{}|{last: UBEntityAttribute, penult: UBEntityAttribute}}
 */
function metaAttributesList (path, rootEntityName) {
  const { attributes } = path.split('.').reduce((accum, field) => {
    const attr = UB.connection.domain.get(accum.entity).attributes[field]
    if (attr) {
      accum.attributes.push(attr)
      if (attr.dataType !== 'Json') {
        accum.entity = attr.associatedEntity
      }
    }
    return accum
  }, {
    entity: rootEntityName,
    attributes: []
  })

  if (attributes.length === 0) {
    return {}
  } else if (attributes.length === 1) {
    return {
      last: attributes[0],
      penult: attributes[0]
    }
  } else {
    return {
      last: attributes[attributes.length - 1],
      penult: attributes[attributes.length - 2]
    }
  }
}
