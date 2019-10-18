const types = {}

module.exports = {
  regiterType (type, component, options) {
    types[type] = Object.assign({ type, component }, options)
  },

  render (type) {
    if (types[type]) {
      return types[type].component
    }
  }
}
