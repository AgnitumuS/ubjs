require('./UBAppConfig')
require('./UBUtil')

/**
 * @author Igor Nozenko
 *
 * localStorage manager
 */

Ext.define('UB.core.UBLocalStorageManager', {
  singleton: true,
  uses: ['UB.core.UBApp'],
  separator: ':',

  /**
   * Returns "key_suffix"
   *
   * @param {string} key
   * @param {string} suffix
   * @returns {string}
   */
  getKey: function (key, suffix) {
    return UB.core.UBUtil.gatherStr(key, '_', suffix)
  },

  /**
   * Returns "key_UI"
   *
   * @param {string} key
   * @returns {string}
   */
  getKeyUI: function (key) {
    return this.getKey(key, 'UI')
  },

  /**
   * Returns "login:key"
   *
   * @param {string} key
   * @returns {string}
   */
  getFullKey: function (key) {
    const login = $App.connection.userLogin()
    return login && login.length ? login + this.separator + key : undefined
  },

  /**
   *
   * @param {string} key
   * @param {Function} [callback]
   * @param [scope]
   * @param {boolean} [decode]
   * @returns {string}
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
   * @param {string} key
   * @param {string} data
   * @param callback
   * @param scope
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
   * @param {string} key
   * @param callback
   * @param scope
   */
  removeItem: function (key, callback, scope) {
    const fullKey = this.getFullKey(key)

    if (fullKey) { UB.core.UBUtil.removeLocalStorageItem(fullKey) }
    Ext.callback(callback, scope || this)
  },

  /**
   * @param {Function} callback
   * @param {object} scope
   */
  clear: function (callback, scope) {
    UB.core.UBUtil.clearLocalStorage()
    Ext.callback(callback, scope || this)
  },

  /**
   *
   * @param {string} [login] (optional)
   * @param callback
   * @param scope
   * @returns {string[]}
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
   * @param {object} scope
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
    const re = /_UI$|^UTableEntity:/
    keys.forEach((key) => {
      if (re.test(key)) {
        localStorage.removeItem(key)
      }
    })
    UB.connection.emit('removedUserDataUI')
  }
})
