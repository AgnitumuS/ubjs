module.exports = {
  name: 'UForm',
  props: {
    labelWidth: [String, Number]
  },
  provide () {
    return {
      ...(this.labelWidth && { labelWidth: this.labelWidth })
    }
  },
  render (h) {
    return h('div', {}, this.$slots.default)
  }
}
