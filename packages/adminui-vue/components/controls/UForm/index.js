/**
 * Wrap component for `<u-form-row>`
 * can provide labelWidth and labelPosition to all
 * child `u-form-row` components
 */
module.exports = {
  name: 'UForm',
  props: {
    /**
     * Set label width to child `<u-form-row>`'s
     * Can be override by same prop in `u-form-row`
     */
    labelWidth: {
      type: Number,
      default: 120
    },
    /**
     * Set label position to child `<u-form-row>`'s
     * Can be override by same prop in `u-form-row`
     */
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
    return h('div', this.$slots.default)
  }
}
