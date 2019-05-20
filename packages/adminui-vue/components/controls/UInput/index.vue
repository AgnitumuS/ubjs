<template>
  <el-input
    ref="input"
    v-model="model"
    class="ub-input"
    :type="type"
    :step="step"
    v-bind="$attrs"
    v-on="listeners"
  >
    <locale-button
      v-if="isMultiLang"
      slot="append"
      :attribute-name="attributeName"
    />
  </el-input>
</template>

<script>
const LocaleButton = require('./LocaleButton.vue').default
/**
 * **important** - use of this component is possible only when using the instance module
 *
 * This component need to set lang data in multilang attributes
 * Component check multilang by attribute name,
 * if attribute is multilang add globe button.
 * After click globe button will shows popup with fetched locales.
 *
 * After save will put data in store, and processing module will build request for all locales
 */
export default {
  name: 'UInput',

  components: { LocaleButton },

  props: {
    /*
     * @model
     */
    value: {
      required: true
    },
    /*
     * attribute name in entitySchema
     */
    attributeName: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      numberTypes: ['Int', 'BigInt', 'Float', 'Currency', 'ID']
    }
  },

  computed: {
    model: {
      get () {
        return this.value
      },
      set (value) {
        if (value === '') {
          this.$emit('input', null)
          return
        }

        if (this.type === 'number') {
          this.$emit('input', +value)
        } else {
          this.$emit('input', value)
        }
      }
    },

    step () {
      if (this.dataType === 'Float') {
        return 1 / 10 ** (this.$UB.connection.domain.FLOATING_SCALE_PRECISION - 1)
      }
      if (this.dataType === 'Currency') {
        return 0.1
      }
      return 1
    },

    precision () {
      if (this.dataType === 'Float') return this.$UB.connection.domain.FLOATING_SCALE_PRECISION
      if (this.dataType === 'Currency') return 2
      return 0
    },

    entitySchema () {
      return this.$store.getters.entitySchema
    },

    dataType () {
      return this.entitySchema.attributes[this.attributeName].dataType
    },

    isMultiLang () {
      return this.entitySchema.attributes[this.attributeName].isMultiLang
    },

    type () {
      const isNumber = this.numberTypes.includes(this.dataType)
      return isNumber ? 'number' : 'text'
    },

    listeners () {
      if (this.type === 'number') {
        return {
          ...this.$listeners,
          change: this.rounding
        }
      } else {
        return this.$listeners
      }
    }
  },

  methods: {
    rounding (value) {
      if (value === null || value === '') {
        return null
      }
      if (this.type !== 'number'){
        return value
      }
      const digit = Number(value)
      const preciseness = 10 ** this.precision
      const rounded = Math.round((digit * preciseness)) / preciseness
      this.$emit('input', rounded)
    }
  }
}
</script>

<style>
.ub-input input::-webkit-inner-spin-button,
.ub-input input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>

<docs>
Component will automaticly check data type by attribute name in entitySchema
Required to have entitySchema in $store.getters

### Basic usage:

```vue
<template>
  <u-input
    v-model="caption"
    attribute-name="caption"
  />
</template>

<script>
export default {
  data () {
    return {
      caption: ''
    }
  }
}
</script>
```
</docs>
