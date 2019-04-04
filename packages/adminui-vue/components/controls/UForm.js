module.exports = {
  name: 'UForm',
  props: {
    labelWidth: {
      type: Number,
      default: 120
    },
    labelPosition: {
      type: String,
      default: 'left'
    }
  },
  provide () {
    return {
      labelWidth: this.labelWidth,
      labelPosition: this.labelPosition
    }
  },
  render (h) {
    return h('div', {}, this.$slots.default)
  }
}
