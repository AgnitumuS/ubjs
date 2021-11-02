require('./UBAppConfig')
require('./UBUtil')


/**
 * Файл: UB.core.UBLocalStorageManager.js
 * Автор: Игорь Ноженко
 *
 * Менеджер localStorage
 *
 * Обеспечивает работу с localStorage
 * Содержит сервисные функции для формирования key'ев
 */

Ext.define('UB.core.UBLocalStorageManager', {
  singleton: true,
  uses: ['UB.core.UBApp'],
  separator: ':',

  /**
   * Возвращает "key_suffix"
   *
   * @param {String} key
   * @param {String} suffix
   * @return {String}
   */
  getKey: function (key, suffix) {
    return UB.core.UBUtil.gatherStr(key, '_', suffix)
  },

  /**
   * Возвращает "key_UI"
   *
   * @param {String} key
   * @return {String}
   */
  getKeyUI: function (key) {
    return this.getKey(key, 'UI')
  },

  /**
   * Возвращает "login:key"
   *
   * @param {String} key
   * @return {String}
   */
  getFullKey: function (key) {
    const login = $App.connection.userLogin()
    return login && login.length ? login + this.separator + key : undefined
  },

  /**
   *
   * @param {String} key
   * @param {Function} [callback]
   * @param [scope]
   * @param {Boolean} [decode]
   * @return {String}
   */
  getItem: function (key, callback, scope, decode) {
    const fullKey = this.getFullKey(key)
    let data = fullKey ? UB.core.UBUtil.getLocalStorageItem(fullKey) : undefined
    if (decode || callback) {
      data = Ext.JSON.decode(data, true)
    }
    Ext.callback(callback, scope || this, [data])
    return data
  },

  /**
   *
   * @param {String} key
   * @param {String} data
   * @param {Boolean} encode (optional)
   */
  setItem: function (key, data, callback, scope) {
    const fullKey = this.getFullKey(key)
    if (Ext.isObject(data)) {
      data = Ext.JSON.encode(data)
    }
    if (fullKey) {
      UB.core.UBUtil.setLocalStorageItem(fullKey, data)
    }
    Ext.callback(callback, scope || this)
  },

  /**
   *
   * @param {String} key
   */
  removeItem: function (key, callback, scope) {
    const fullKey = this.getFullKey(key)

    if (fullKey) { UB.core.UBUtil.removeLocalStorageItem(fullKey) }
    Ext.callback(callback, scope || this)
  },

  /**
   * @param {Function} callback
   * @param {Object} scope
   */
  clear: function (callback, scope) {
    UB.core.UBUtil.clearLocalStorage()
    Ext.callback(callback, scope || this)
  },

  /**
   *
   * @param {String} [login] (optional)
   * @return {String[]}
   */
  getUserKeys: function (login, callback, scope) {
    const keys = []
    const allKeys = UB.core.UBUtil.getLocalStorageKeys()
    let m

    login = login || $App.connection.userLogin()
    const regexp = new RegExp(Ext.util.Format.format('(?:{0}{1})(.*)', login, this.separator))
    for (let i = 0, len = allKeys.length; i < len; ++i) {
      m = UB.core.UBUtil.getRegExpGroup(allKeys[i], regexp, 1)
      if (m) {
        keys.push(m)
      }
    }

    Ext.callback(callback, scope || this, [keys])
    return keys
  },

  getKeys: function (callback, scope) {
    const keys = UB.core.UBUtil.getLocalStorageKeys()
    Ext.callback(callback, scope || Ext.global, [keys])
    return keys
  },
  /**
   *
   * @param {RegExp} regexp
   * @param {Function} fn
   * @param {Object} scope
   */
  removeUserItemsRegExp: function (regexp, fn, scope) {
    const keys = this.getUserKeys()
    fn = fn || this.removeItem
    scope = scope || this
    for (let i = 0, len = keys.length; i < len; ++i) {
      if (regexp.test(keys[i])) {
        fn.call(scope, keys[i])
      }
    }
  },

  removeUserDataUI: function () {
    const keys = this.getKeys()
    const re = /_UI$/
    keys.forEach(function (key) {
      if (re.test(key)) {
        localStorage.removeItem(key)
      }
    })
  }
})
