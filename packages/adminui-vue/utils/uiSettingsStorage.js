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
    const keyParts = [componentKey, settingsKey, instanceKey].filter(part => part !== undefined)
    return ['portal', ...keyParts].join(':')
  }

  /**
   * @param {string} key
   * @param {*} value
   */
  setValue (key, value) {
    this.#localStorage.setItem(key, JSON.stringify({ data: value }))
  }

  /**
   * @param {string} key
   * @returns {*}
   */
  getValue (key) {
    const value = this.#localStorage.getItem(key)
    if (value === null) {
      return null
    }

    let parsedValue
    try {
      parsedValue = JSON.parse(value)
    } catch {
      return null
    }

    const parsedValueIsObject = typeof parsedValue === 'object' && parsedValue !== null
    return parsedValueIsObject && 'data' in parsedValue ? parsedValue.data : null
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
