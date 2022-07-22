const { connection } = require('@unitybase/ub-pub')

class UISettingsStorage {
  #localStorage = globalThis.localStorage

  /**
   * @param {string} componentKey
   * @param {string} settingsKey
   * @param {string|number} [instanceKey]
   * @returns {string}
   */
  getKey (componentKey, settingsKey, instanceKey) {
    const keyParts = [componentKey, settingsKey, instanceKey].filter(Boolean)
    return ['portal', ...keyParts].join(':')
  }

  /**
   * @param {string} key
   * @param {string} value
   */
  setValue (key, value) {
    this.#localStorage.setItem(key, value)
  }

  /**
   * @param {string} key
   * @returns {string|null}
   */
  getValue (key) {
    return this.#localStorage.getItem(key)
  }

  clear () {
    for (const key of Object.keys(this.#localStorage)) {
      if (key.startsWith('portal:')) {
        this.#localStorage.removeItem(key)
      }
    }
    connection.emit('portal:resetGUI')
  }
}

module.exports = new UISettingsStorage()
