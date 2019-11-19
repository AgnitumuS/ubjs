/**
 * Wrap component for `<u-form-row>`
 * can provide labelWidth and labelPosition to all
 * child `u-form-row` components
 */
/* TODO: refactor as .vue component */
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
    },
    /**
     * If set 'false' disable autofocus on mounted. 'true' by default
     */
    autofocus: {
      type: Boolean,
      default: true
    }
  },
  provide () {
    return {
      labelWidth: this.labelWidth,
      labelPosition: this.labelPosition
    }
  },
  render (h) {
    const slot = this.$slots.default
    return h('form', {
      attrs: {
        tabindex: 1, // need to catch focus on form for handle keydown events on form
        autocomplete: 'off'
      },
      style: {
        overflow: 'auto',
        flexGrow: '1'
      },
      on: {
        submit (event) {
          event.preventDefault()
        }
      }
    }, [
      h(
        'div', {
          style: { padding: '1em' }
        },
        [slot]
      )
    ])
  },

  mounted () {
    if (this.autofocus) {
      this.setFocus()
    }
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
