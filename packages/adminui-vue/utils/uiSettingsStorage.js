/**
 * Storage for User Interface settings. Wrapper around `localStorage`
 *
 * It is recommended to use this module instead of direct access to the `localStorage`.
 *
 * User can clear all settings using `User menu` -> `Reset GUI Settings`.
 *
 * Module is injected into `Vue.prototype` as `$uiSettings` and exported as `@unitybase/adminui-vue`.uiSettings
 *
 * @example
// inside vue can be used as this.$uiSettings
// restore some setting
this.videoRatio = this.$uiSettings.get('UFileWebcamButton', 'videoRatio') ?? this.videoRatios[0]
// save setting
this.$uiSettings.put(this.videoRatios[0], 'UFileWebcamButton', 'videoRatio')
// or from adminui-vue exports
const App = require('@unitybase/adminui-vue')
const isCollapsed = App.uiSettings.get('sidebar', 'isCollapsed')
 * @module uiSettings
 * @memberOf module:@unitybase/adminui-vue
 */
module.exports = {
  put,
  get,
  clear,
  buildKey,
  putByKey,
  getByKey
}
const _localStorage = globalThis.localStorage

/**
 * Put (save) value into setting storage
 *
 * @param {*} value
 * @param {string} component Name of the component setting is stored for
 * @param {string} property Property name (usually - a component property)
 * @param {string} [instance] Optional - name of the component instance, if case settings stored per-instance
 */
function put (value, component, property, instance) {
  const key = buildKey(component, property, instance)
  putByKey(value, key)
}

/**
 * Retrieve value from storage
 *
 * @param {string} component Name of the component setting is stored for
 * @param {string} property Property name (usually - a component property)
 * @param {string} [instance] Optional - name of the component instance, if case settings stored per-instance
 * @returns {*}
 */
function get (component, property, instance) {
  const key = buildKey(component, property, instance)
  return getByKey(key)
}

/**
 * Remove all settings from storage. If component or both component and property are specified - remove only for it
 *
 * @param {string} [component] Optional name of the component to remove settings for
 * @param {string} [property] Optional name of the component property remove settings for. Component must be specified
 */
function clear (component, property) {
  const prefix = ['portal', component, property].filter(v => !!v).join(':')
  for (const key of Object.keys(_localStorage)) {
    if (key.startsWith(prefix)) {
      _localStorage.removeItem(key)
    }
  }
  // TODO - $App should be a `portal` component when it will be implemented
  $App.fireEvent('portal:resetUI')
}

/**
 * Build a key name for storing data based on component, property and optionally instance
 *
 * @param {string} component
 * @param {string} property
 * @param {string} [instance]
 * @returns {string}
 */
function buildKey (component, property, instance) {
  return instance
    ? `portal:${component}:${property}:${instance}`
    : `portal:${component}:${property}`
}

/**
 * Put value into storage. If value === undefined - remove storage key
 *
 * @param {*} value
 * @param {string} key
 */
function putByKey (value, key) {
  if (value === undefined) {
    _localStorage.removeItem(key)
  } else {
    _localStorage.setItem(key, JSON.stringify(value))
  }
}

/**
 * @param {string} key
 * @returns {*}
 */
function getByKey (key) {
  let value
  try {
    value = JSON.parse(_localStorage.getItem(key))
  } catch {
    // remove invalid value
    _localStorage.removeItem(key)
    value = null
  }
  return value
}
