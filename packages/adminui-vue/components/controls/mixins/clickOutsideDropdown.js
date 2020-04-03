const {
  addClickOutsideListener,
  removeClickOutsideListener
} = require('../../../utils/clickOutside')
const Vue = require('vue')

module.exports = {
  data () {
    return {
      _clickOutsideListenerId: null
    }
  },

  mounted () {
    /**
     * input in USelectEntity is Vue component
     * but in USelectMultiple input is dom el
     * so need to check it
     */
    const input = this.$refs.input instanceof Vue
      ? this.$refs.input.$el
      : this.$refs.input

    const refs = [input, this.$refs.options]

    this._clickOutsideListenerId = addClickOutsideListener(refs, () => {
      this.dropdownVisible = false
      if (this.setQueryByValue) {
        this.setQueryByValue(this.value)
      }
    })
  },

  beforeDestroy () {
    removeClickOutsideListener(this._clickOutsideListenerId)
  }
}
