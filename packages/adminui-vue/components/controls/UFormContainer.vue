<template>
  <form
    tabindex="1"
    autocomplete="off"
    @submit.prevent
  >
    <slot />
  </form>
</template>

<script>
/**
 * Wrap component for `<u-form-row>`
 * can provide labelWidth and labelPosition to all
 * child `u-form-row` components
 */

export default {
  name: 'UFormContainer',

  props: {
    /**
     * Set label width to child `<u-form-row>`'s
     * Can be override by same prop in `u-form-row`.
     * Will ignored with labelPosition === 'top'
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
    },

    /**
     * Max width in px
     */
    maxWidth: Number
  },

  provide () {
    return {
      labelWidth: this.labelWidth,
      labelPosition: this.labelPosition,
      maxWidth: this.maxWidth
    }
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
</script>

<docs>
This component is intended for:
- set focus to the first available component on mount
- set's a labels width
- set's a labels position

### Basic usage

All labels will have 150 width instead last, the option `u-form-row` will override `u-form` label-width

```vue
<template>
  <u-form-container :label-width="150">
    <u-form-row label="Name">
      <el-input v-model="name" />
    </u-form-row>

    <u-form-row label="Surname">
      <el-input v-model="surname" />
    </u-form-row>

    <u-form-row label="Age">
      <el-input-number v-model="age" />
    </u-form-row>

    <u-form-row
        label="Short"
        :label-width="90"
    >
      <el-checkbox v-model="checkbox" />
    </u-form-row>
  </u-form-container>
</template>

<script>
  export default {
    data () {
      return {
        name: '',
        surname: '',
        age: null,
        checkbox: false
      }
    }
  }
</script>
```
</docs>
