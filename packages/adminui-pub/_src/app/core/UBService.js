require('./UBApp')
require('./UBAppConfig')
/**
 *
 * @deprecated
 */
Ext.define('UB.core.UBService', {
  singleton: true,

  TRANSACTION_ID: 0,

  method: {
    runList: 'runList',
    getDocument: 'getDocument'
  },
  enableBuffer: 20,

  callTask: null,

  callBuffer: [],
  /**
   *
   * @ param {String} methodName
   * @return {String}
   * @deprecated
   */
  getUrl: function (/* methodName */) {
    throw new Error('deprecated. Use methods from $App.connection \r\n' +
            ' $App.connection.authorize().then(function(session){\r\n' +
            " me.dom.href = Ext.String.urlAppend( me.href, 'session_signature='+session.signature())\r\n" +
            '})\r\n')
  },

  /**
     *
     * @param {Object[]} params
     * @param {Function} callback
     * @param {Object} scope
     * @deprecated Use $App.connection.run({entity:...}).then(..) or $App.connection.runTrans([{entity:...}])
     */
  runList: function (params, callback, scope) {
    UB.logDebug('UBService.runList is deprecated. Use $App.connection.run({entity:...}).then(..) or runTrans([{entity:...}])')
    var
      me = this
    var enableBuffer = me.enableBuffer

    if (!Ext.isArray(params)) {
      params = [params]
    }
    if (enableBuffer && params.length === 1) {
      me.callBuffer.push({
        transactionId: ++UB.core.UBService.TRANSACTION_ID,
        params: params[0],
        callback: callback,
        scope: scope
      })

      if (!me.callTask) {
        me.callTask = new Ext.util.DelayedTask(me.combineAndSend, me)
      }

      me.callTask.delay(Ext.isNumber(enableBuffer) ? enableBuffer : 10)
    } else {
      me.sendRequest(params, callback, scope)
    }
  },

  combineAndSend: function () {
    var me = this
    var buffer = me.callBuffer
    var len = buffer.length

    if (len > 0) {
      me.sendRequest()
      me.callBuffer = []
    }
  },

  /**
     * Sends a request to the server
     *
     * @param {Object/Array} [data] The data to send. If no data passed - send each callBuffer
     * @param {Function} [callback]
     * @param {Object} [scope]
     * @private
     * @deprecated
     */
  sendRequest: function (data, callback, scope) {
    var
      me = this
    var params = []
    var callBackList = {}
    if (data) {
      params = data
    } else {
      Ext.each(me.callBuffer, function (item) {
        callBackList[item.transactionId] = {
          fn: item.callback,
          scope: item.scope
        }
        item.params.transactionId = item.transactionId
        params.push(item.params)
      })
    }

    $App.connection.post('ubql', params)
      .then(function (response) {
        let result = response.data
        let jsonData = response.config.data
        if (data) {
          Ext.callback(callback, scope, [result, jsonData])
        } else {
          Ext.each(result, function (item, index) {
            var callback = callBackList[item.transactionId]
            Ext.callback(callback.fn, callback.scope, [[item], jsonData[index]], 0)
          })
        }
      }, function (failReason) {
        if (data) {
          Ext.callback(callback, scope, [{
            serverFailure: true
          }])
        } else {
          Ext.Object.each(callBackList, function (index, callback) {
            Ext.callback(callback.fn, callback.scope, [{
              serverFailure: true
            }], 0)
          })
        }
        if (failReason.data && failReason.data.errMsg) {
          throw new Error(failReason.data.errMsg)
        } else {
          throw failReason
        }
      })
  },
  /**
   *
   * @param {Object} params
   * @param {Function} [callback]
   * @param {Object} [scope] Callback scope
   * @param {Object} [options]
   * @param {Boolean} [options.binary]
   * @param {Boolean} [options.usePostMethod]
   * @param {Boolean} [options.noCache]
   * @deprecated Use UB.Connection.getDocument instead
   * @returns {Promise|null} If callback is not null return null
   */
  getDocument: function (params, callback, scope, options) {
    var me = this; var promise
    var opt = Ext.apply({}, options)
    var allowedParams = ['entity', 'attribute', 'ID', 'id', 'isDirty', 'forceMime', 'fileName', 'store', 'revision']
    var reqParams = {
      url: 'getDocument',
      method: opt.usePostMethod ? 'POST' : 'GET'
    }
    if (options && options.binary) {
      reqParams.responseType = 'arraybuffer'
    }
    if (opt.usePostMethod) {
      reqParams.data = _.clone(params)
      Object.keys(reqParams.data).forEach(function (key) {
        if (allowedParams.indexOf(key) === -1) {
          delete reqParams.data[key]
          UB.logDebug('invalid parameter "' + key + '" passed to getDocument request')
        }
      })
    } else {
      reqParams.params = params
    }
    promise = $App.connection.xhr(reqParams)
      .then(function (response) {
        if (callback) {
          Ext.callback(callback, scope || me, [response.data, params])
        }
        return response.data
      })
      .catch(function () {
        UB.showErrorWindow('<span style="color: red">' + UB.i18n('documentNotFound') + '<span/>')
      })
    if (callback) {
      return null
    } else {
      return promise
    }
  },

  /**
   * @deprecated
   */
  setDocument: function () {
    throw new Error('UBService.setDocument is deprecated!!')
  },

  /**
     * @deprecated
     */
  setUserData: function (/* params, callback, scope */) {
    throw new Error('deprecated. Use uba_user.changeLanguage')
  }
})
