module.exports = {
  data () {
    return {
      inerhitedSlots: {}
    }
  },

  provide () {
    return {
      inerhitedSlots: this.inerhitedSlots
    }
  },

  mounted () {
    for (const [name, slot] of Object.entries(this.$scopedSlots)) {
      this.$set(this.inerhitedSlots, name, {
        render () {
          return slot(this.$attrs)
        }
      })
    }
  }
}
