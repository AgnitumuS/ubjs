/**
 * Wrap component for `<u-form-row>`
 * can provide labelWidth and labelPosition to all
 * child `u-form-row` components
 */
module.exports = {
  name: 'UFormContainer',
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
    return h('form', {
      attrs: {
        tabindex: 1, // need to catch focus on form for handle keydown events on form
        autocomplete: 'off'
      },
      style: {
        overflow: 'auto',
        padding: '1em',
        flexGrow: '1'
      },
      on: {
        submit (event) {
          event.preventDefault()
        }
      }
    }, this.$slots.default)
  },

  mounted () {
    this.setFocus()
  },

  methods: {
    async setFocus () {
      /*
       * added $nextTick because when UForm isMounted, its childrens are not yet,
       * so you need to wait until the whole tree is built
       */
      await this.$nextTick()
      for (const el of this.$el.elements) {
        if (!el.disabled) {
          el.focus()
          break
        }
      }
    }
  }
}
