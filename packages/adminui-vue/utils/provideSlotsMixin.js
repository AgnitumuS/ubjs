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
          // if (this.$scopedSlots.main) {
          //   debugger
          // }
          return slot({
            ...this.$attrs,
            defaultComponents: transformToComponents(this.$scopedSlots)
          })
        }
      })
    }
  }
}

function transformToComponents (slots) {
  return Object.entries(slots)
    .reduce((accum, [name, slot]) => {
      accum[name] = {
        render: slot
      }
      return accum
    }, {})
}
