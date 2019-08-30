const Vue = require('vue')

module.exports = {
  mounted () {
    document.body.addEventListener('click', this._clickOutside)
  },

  beforeDestroy () {
    document.body.removeEventListener('click', this._clickOutside)
  },

  methods: {
    _clickOutside (e) {
      /**
       * input in USelectEntity is Vue component
       * but in USelectMultiple input is dom el
       * so need to check it
       */
      const input = this.$refs.input instanceof Vue
        ? this.$refs.input.$el
        : this.$refs.input

      const refs = [input, this.$refs.options]
      const isTarget = refs.some(ref => {
        return ref && ref.contains(e.target)
      })

      if (!isTarget) {
        this.dropdownVisible = false
      }
    }
  }
}
