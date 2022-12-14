/* global ubs_numcounter TubDataStore */
const UB = require('@unitybase/ub')
const Session = UB.Session
/**
 * @deprecated
 */
exports.Service = {
  /**
   * Returns array of supported languages
   * @deprecated Use me.entity.connectionConfig.supportLang
   * @method
   * @param {ubMethodParams} ctxt
   * @return {Array}
   */
  getSupportLang: function (ctxt) {
    return ctxt.dataStore.entity.connectionConfig.supportLang
  },

  /**
   * Returns true in case when insert method works in given context
   * @deprecated Use ctx.mParams.method === 'insert'
   * @method
   * @param {ubMethodParams} ctxt
   * @return {Boolean}
   */
  inserting: function (ctxt) {
    return (ctxt.mParams.method === 'insert')
  },

  /**
   * Returns true in case update method works in given context
   * @deprecated Use ctxt.mParams.method === 'update'
   * @method
   * @param {ubMethodParams} ctxt
   * @return {Boolean}
   */
  updating: function (ctxt) {
    return (ctxt.mParams.method === 'update')
  },

  /**
   * Returns true in case when delete method works in given context
   * @method
   * @deprecated Use ctxt.mParams.method === 'delete'
   * @param {ubMethodParams} ctxt
   * @return {Boolean}
   */
  deleting: function (ctxt) {
    return (ctxt.mParams.method === 'delete')
  },

  /**
   * Return old values
   * @method
   * @param {ubMethodParams} ctxt
   * @return {Object}
   */
  getOldValues: function (ctxt) {
    let currentDataName = ctxt.dataStore.currentDataName
    const method = ctxt.mParams.method
    if (method === 'insert') return ctxt.mParams.execParams

    ctxt.dataStore.currentDataName = method === 'update'
      ? TubDataStore.DATA_NAMES.BEFORE_UPDATE
      : method === 'delete'
        ? TubDataStore.DATA_NAMES.BEFORE_DELETE
        : currentDataName
    let oldValues = ctxt.dataStore.getAsJsObject()
    ctxt.dataStore.currentDataName = currentDataName
    return (oldValues && oldValues.length) ? oldValues[0] : ctxt.mParams.execParams
  },

  /**
   * Returns the next code generated from ubs_numcounter for entity
   * @method
   * @param {ubMethodParams} ctxt
   * @return {Number}
   */
  getNextCode: function (ctxt) {
    return ubs_numcounter.getRegnum(ctxt.dataStore.entity.name, 1)
  },

  /**
   * Sets the 'code' attribute value if the user has not provided one.
   * In this case developer must provide on client default value of attribute
   * named 'code'.
   * For example, in *.def file, desirable '----' like this { attributeName: "code", defaultValue: '----'}
   * @method
   * @deprecated Use ubs_numcounter.generateAutoIncrementalCode (+ set default value for a attribute)
   * @param {ubMethodParams} ctxt
   * @param {string} [emptyCode]  - string that means emptyCode value
   * @param {number} [codeLen] - length of 'CODE' attribute
   * @param {string} fillChar
   */
  setCode: function (ctxt, emptyCode, codeLen, fillChar) {
    var
      entityName, // = ctxt.dataStore.entityName ************* this code doesn't work,
      mParams = ctxt.mParams,
      newNum,
      execParams = mParams.execParams

    if (execParams && ((execParams.code === (emptyCode || '----')) || !execParams.code)) {
      entityName = mParams.entity // This works fine
      newNum = '' + ubs_numcounter.getRegnum(entityName, 1)
      execParams.code = newNum.padStart(codeLen || 12, fillChar || '0')
    }
  },
  /**
   * @method
   * Sets the attribute value named attrName by ID of associatedEntity with CODE==codeValue in case codeValue is provided.
   * Otherwise sets the attribute value named attrName by ID of associatedEntity with smallest CODE value
   * @param {ubMethodParams} ctxt
   * @param {string} attrName
   * @param {string} [codeValue]
   */
  setassociatedEntityValueByCode: function (ctxt, attrName, codeValue) {
    var
      attr = ctxt.dataStore.entity.attr(attrName),
      assocObjectName,
      mParams = ctxt.mParams,
      execParams = mParams.execParams
    if (!attr) {
      throw new Error('<<<UB.Service.setassociatedEntityValueByCode() - attribute ' + attrName + ' not found >>>')
    }
    assocObjectName = attr.associatedEntity
    if (!assocObjectName) {
      throw new Error('<<<UB.Service.setassociatedEntityValueByCode - associatedEntity for attribute ' + attrName + ' not found >>>')
    }
    let inst = UB.DataStore(assocObjectName)
    if (!codeValue) { // take the row with smallest value of CODE
      inst.run('select', { fieldList: ['code', 'ID'],
        orderList: {'0': {'expression': 'code', 'order': 'desc'}},
        options: {start: 0, limit: 1}
      })
    } else {
      inst.run('select', { fieldList: ['code', 'ID'],
        whereList: {
          'code': { expression: '[code]',
            condition: 'equal',
            values: {'code': codeValue}
          }
        }
      })
    }
    if (!inst.eof) {
      if (!execParams) {
        mParams.execParams = {}
        execParams = mParams.execParams
      }
      execParams[attrName] = inst.get('ID')
    }
  },
  /**
   *  @method
   *  Makes the additional SQL clauses for entity with Select method overriden. See tri_sale_pos_by_carrier.js or
   *  repo_sal_ret_outdate.js for usage example
   * @param {ubMethodParams} ctxt
   * @param {Object} resultParams
   * @param {Object} aliases
   * @param {String} [defaultOrderBy]
   * @return {Object}
   */
  getClauses: function (ctxt, resultParams, aliases, defaultOrderBy) {
    let result = {
      rowsClause: '',
      topClause: '',
      whereClause: '',
      orderClause: '',
      havingClause: ''
    }
    result.whereClause = this.getWhere(ctxt, resultParams, aliases)
    result.orderClause = this.getOrderBy(ctxt, defaultOrderBy || '', aliases)
    result.topClause = this.getLimit(ctxt)
    if (result.topClause.indexOf('OFFSET') !== -1) {
      result.rowsClause = result.topClause
      result.topClause = ''
    }
    return result
  },
  /**
   * @method
   * Call directly on your own risk. Internally called by getClauses()
   * @private
   * @param {ubMethodParams} ctxt
   * @param {Object} resultParams
   * @param {Object} aliases
   * @return {String}
   */
  getWhere: function (ctxt, resultParams, aliases) {
    var
      wList = ctxt.mParams.whereList,
      attrs = ctxt.dataStore.entity.attributes,
      where = '', values, attr, w, fld, dType, q

    for (w in wList) {
      values = wList[w].values
      for (attr in values) {
        if ((typeof resultParams[attr] !== 'undefined') || (typeof wList[w].condition === 'undefined')) { // missed condition in params
          resultParams[attr] = values[attr]
        } else {
          dType = attrs[attr].dataType
          q = (attrs[attr] && (dType === TubAttrDataType.String ||
             dType == 'String' ||
             dType == TubAttrDataType.Enum ||
             dType == 'Enum' ||
             dType == TubAttrDataType.DateTime ||
             dType == 'DateTime'
          )) ? "'" : ''
          fld = aliases[attr] || attr
          if (fld === 'no_filter') {
            continue
          }
          switch (wList[w].condition) {
            case 'equal' : where += ' AND ' + fld + ' = ' + q + values[attr] + q + '\r\n'; break
            case 'startWith' : where += ' AND ' + fld + " like '" + values[attr] + "%'\r\n"; break
            case 'like' : where += ' AND ' + fld + " like '%" + values[attr] + "%'\r\n"; break
            case 'moreEqual' : where += ' AND ' + fld + ' >= ' + q + values[attr] + q + '\r\n'; break
            case 'lessEqual' : where += ' AND ' + fld + ' <= ' + q + values[attr] + q + '\r\n'; break
            case 'more' : where += ' AND ' + fld + ' > ' + q + values[attr] + q + '\r\n'; break
            case 'less' : where += ' AND ' + fld + ' < ' + q + values[attr] + q + '\r\n'; break
            default : throw new Error('<<<UB.Service.getWhere() : unknown whereList condition - ' + wList[w].condition + ' >>>')
          }
        }
      }
    }
    return where
  },
  /**
   * Call directly on your own risk. Internally called by getClauses()
   * @method
   * @private
   * @param {ubMethodParams} ctxt
   * @param {String} [defaultOrderBy]
   * @return {String}
   */
  getOrderBy: function (ctxt, defaultOrderBy, aliases) {
    var
      oList = ctxt.mParams ? ctxt.mParams.orderList : ctxt,
      result = '',
      expr

    if (oList && oList[0]) {
      expr = oList[0].expression
      result = expr + ' ' + oList[0].order
    } else {
      result = defaultOrderBy
    }
    if (!result) {
      return '/* NO ORDER BY */\r\n'
    }
    return 'order by ' + result + '\r\n'
  },
  /**
   * @method
   * Call directly on your own risk. Internally called by getClauses()
   * @private
   * @param {ubMethodParams} ctxt
   * @return {String}
   */
  getLimit: function (ctxt) {
    let options = ctxt.mParams ? ctxt.mParams.options : ctxt
    if (options && options.limit) {
      return options.start === 0
        ? ' TOP ' + options.limit + '\r\n'
        : ' OFFSET ' + options.start + ' ROWS FETCH NEXT ' + options.limit + ' ROWS ONLY \r\n'
    }
    return '/*NO LIMIT*/'
  },
  /**
   * @method
   * Checks whether the current user is a member of the specified group
   * @param {string} groupName
   * @return {Boolean}
   */
  userIsMemberOf: function (groupName) {
    let re = new RegExp(`\\b${groupName}\\b`)
    return re.test(Session.uData.roles)
  }
}
