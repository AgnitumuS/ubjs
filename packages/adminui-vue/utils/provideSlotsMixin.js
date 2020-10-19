module.exports = {
  data () {
    return {
      inheritedSlots: {}
    }
  },

  provide () {
    return {
      inheritedSlots: this.inheritedSlots
    }
  },

  mounted () {
    for (const [name, slot] of Object.entries(this.$scopedSlots)) {
      this.$set(this.inheritedSlots, name, {
        render () {
          return slot(this.$attrs)
        }
      })
    }
  }
}
