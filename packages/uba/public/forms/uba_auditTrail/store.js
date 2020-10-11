const UB = require('@unitybase/ub-pub')
const { lookups } = require('@unitybase/adminui-vue')
const { formatByPattern } = require('@unitybase/cs-shared')
const { diffWords } = require('./diff')

const excludeSystemAttrsRe = /^ID|mi_(\S)+/
const langAttrRe = /(\S+)_([a-z]+)\^$/

module.exports = {
  state () {
    return {
      tableData: []
    }
  },

  getters: {
    oldData (state) {
      return parseDiffValue(state.data.fromValue)
    },

    newData (state) {
      return parseDiffValue(state.data.toValue)
    },

    attributesFromDiffs (state, getters) {
      return Array.from(
        new Set([
          ...Object.keys(getters.oldData),
          ...Object.keys(getters.newData)
        ])
      )
        .filter(attr => !excludeSystemAttrsRe.test(attr))
    }
  },

  mutations: {
    SET_TABLE_DATA (state, tableData) {
      state.tableData.splice(0, state.tableData.length, ...tableData)
    }
  },

  actions: {
    async enrichTableData ({ state, getters, commit }) {
      const [updatedOldData, updatedNewData] = await transformData(
        state.data.entity,
        getters.attributesFromDiffs,
        getters.oldData,
        getters.newData
      )

      const tableData = getters.attributesFromDiffs
        .map(attr => {
          const row = {}
          row.attrName = buildLabel(state.data.entity, attr)
          const { oldValue, newValue } = diffWords(updatedOldData[attr], updatedNewData[attr])
          row.oldValue = oldValue
          row.newValue = newValue
          row.dataType = getAttrMeta(state.data.entity, attr).dataType

          return row
        })

      commit('SET_TABLE_DATA', tableData)
    }
  }
}

/**
 * @param {string} entityName Entity name
 * @return {UBEntity} Entity schema
 */
function getEntityMeta (entityName) {
  return UB.connection.domain.get(entityName)
}

/**
 * Gets meta for any attrs includes lang attrs - "caption_en^"
 *
 * @param {string} entityName Entity name
 * @param {string} attr Attr code
 * @return {UBEntityAttribute} UB attribute meta
 */
function getAttrMeta (entityName, attr) {
  return getEntityMeta(entityName).attributes[attr.replace(langAttrRe, '$1')]
}

/**
 * In case lang attrs then appends translated name of language in brackets.
 * For example "caption_en^" will converts to "Caption (English)"
 *
 * @param {string} entity Entity name
 * @param {string} attr Attr code
 * @return {string} Label
 */
function buildLabel (entity, attr) {
  if (langAttrRe.test(attr)) {
    const label = `${entity}.${attr.replace(langAttrRe, '$1')}`
    const langLabel = attr.replace(langAttrRe, '$2')
    return `${UB.i18n(label)} (${UB.i18n(langLabel)})`
  } else {
    return UB.i18n(`${entity}.${attr}`)
  }
}

/**
 * Transforms data by UBDataType's.
 *
 * @param {string} parentEntity Name of parent entity
 * @param {string[]} attrs Attrs codes
 * @param {object|null|undefined} oldData Old data
 * @param {object|null|undefined} newData New data
 *
 * @return {Promise<[object, object]>} Updated data
 */
async function transformData (parentEntity, attrs, oldData, newData) {
  const updatedOldData = Object.assign({}, oldData)
  const updatedNewData = Object.assign({}, newData)

  // Promise list to load lookups
  const requests = []
  // List of transformations for each response. All indexes equals with requests
  const responseTransforms = []
  for (const attr of attrs) {
    const attrMeta = getAttrMeta(parentEntity, attr)

    for (const data of [updatedOldData, updatedNewData]) {
      data[attr] = formatValue(data, attrMeta, attr, requests, responseTransforms)
    }

    if (attrMeta.dataType === 'Document') {
      // remove keys which has equal values
      const [
        updatedOldValue,
        updatedNewValue
      ] = cleanEqualsInDocumentAttrs(updatedOldData[attr], updatedNewData[attr])

      updatedOldData[attr] = updatedOldValue
      updatedNewData[attr] = updatedNewValue
    }
  }

  const responses = await Promise.all(requests)
  responses.forEach((response, index) => {
    responseTransforms[index](response)
  })

  return [updatedOldData, updatedNewData]
}

/**
 * @param {*} value Json as string
 * @return {object} Parsed json
 */
function parseDiffValue (value) {
  if (typeof value === 'string' && value.length > 0) {
    return JSON.parse(value)
  } else {
    return {}
  }
}

/**
 * Returns document attrs which has just different keys.
 *
 * @param {string} from
 * @param {string} to
 * @return {string[]}
 */
function cleanEqualsInDocumentAttrs (from, to) {
  const oldJson = from === '' ? {} : JSON.parse(from)
  const newJson = to === '' ? {} : JSON.parse(to)

  const keysToDelete = Array.from(
    new Set([
      ...Object.keys(oldJson),
      ...Object.keys(newJson)
    ])
  )
    .filter(key => oldJson[key] === newJson[key])

  for (const key of keysToDelete) {
    delete oldJson[key]
    delete newJson[key]
  }

  function jsonStringify (json) {
    if (Object.keys(json).length) {
      return JSON.stringify(json, null, 2)
    } else {
      return ''
    }
  }

  return [
    jsonStringify(oldJson),
    jsonStringify(newJson)
  ]
}

/**
 * Format value by UBDataType and enrich lookups promises.
 *
 * @param {object} dataObject Data object
 * @param {UBEntityAttribute} attrMeta UB attribute
 * @param {string} attrCode Attr code
 * @param {promise[]} requests Requests to load lookups
 * @param {function[]} responseTransforms Transformations for each lookup request
 * @return {string} Formated value
 */
function formatValue (dataObject, attrMeta, attrCode, requests, responseTransforms) {
  const value = dataObject[attrCode]

  switch (attrMeta.dataType) {
    case 'String':
    case 'Text':
    case 'Number':
    case 'BigInt':
    case 'Boolean':
    case 'Currency':
    case 'Float':
    case 'ID':
    case 'Int':
    case 'Json':
    case 'Document':
      if (value === null || value === undefined) {
        return ''
      } else {
        return String(value)
      }

    case 'Date':
      return formatByPattern.formatDate(value, 'date')

    case 'DateTime':
    case 'TimeLog':
      return formatByPattern.formatDate(value, 'dateTime')

    case 'Enum':
      return lookups.getEnum(attrMeta.enumGroup, value) || ''

    case 'Entity': {
      if (value === undefined || value === null) return ''

      const { associatedEntity, associationAttr = 'ID' } = attrMeta
      const descriptionAttribute = getEntityMeta(associatedEntity).getDescriptionAttribute()
      const request = UB.Repository(associatedEntity)
        .attrs(
          ...new Set(['ID', associationAttr, descriptionAttribute])
        )
        .where(associationAttr, '=', value)
        .select()

      requests.push(request)
      responseTransforms.push(resultData => {
        dataObject[attrCode] = resultData.length > 0
          ? `${value} (${resultData[0][descriptionAttribute]})`
          : dataObject[attrCode] = ''
      })
    }
      break

    case 'Many': {
      if (!value) return ''

      const { associatedEntity, associationAttr = 'ID' } = attrMeta
      const descriptionAttribute = getEntityMeta(associatedEntity).getDescriptionAttribute()
      const ids = value.split(',').map(id => Number(id))
      const request = UB.Repository(associatedEntity)
        .attrs(
          ...new Set(['ID', associationAttr, descriptionAttribute])
        )
        .where(associationAttr, 'in', ids)
        .select()

      requests.push(request)
      responseTransforms.push(resultData => {
        dataObject[attrCode] = resultData
          .map(row => `${row[associationAttr]} (${row[descriptionAttribute]})`)
          .join(', ')
      })
    }
      break

    default:
      return ''
  }
}
