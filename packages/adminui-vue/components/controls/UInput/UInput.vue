<template>
  <u-base-input
    v-model="model"
    :type="getType"
    :step="getStep"
    :precision="getPrecision"
    v-bind="$attrs"
  >
    <locale-button
      v-if="getMultilang"
      slot="append"
      :attribute-name="attributeName"
    />
  </u-base-input>
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

const numberTypes = ['Int', 'BigInt', 'Float', 'Currency', 'ID']

export default {
  name: 'UInput',
  components: { LocaleButton },
  inject: ['entitySchema', '$v'],

  props: {
    /**
     * attribute name in entitySchema
     */
    attributeName: {
      type: String,
      required: true
    },
    /**
     * overwrite "step", which was getting from entitySchema by attribute name
     */
    step: Number,
    /**
     * overwrite "precision", which was getting from entitySchema by attribute name
     */
    precision: Number,
    /**
     * use :multilang="false" if you need hide locale button in multilang attribute
     */
    multilang: {},
    /**
     * overwrite "type", which was getting from entitySchema by attribute name
     */
    type: String
  },

  computed: {
    getStep () {
      if (this.step !== undefined) {
        return this.step
      }
      if (this.dataType === 'Float') {
        return 1 / 10 ** (this.$UB.connection.domain.FLOATING_SCALE_PRECISION - 1)
      }
      if (this.dataType === 'Currency') {
        return 0.1
      }
      return 1
    },

    getPrecision () {
      if (this.precision !== undefined) {
        return this.precision
      }
      if (this.dataType === 'Float') return this.$UB.connection.domain.FLOATING_SCALE_PRECISION
      if (this.dataType === 'Currency') return 2
      return 0
    },

    dataType () {
      return this.entitySchema.attributes[this.attributeName].dataType
    },

    getMultilang () {
      if (this.multilang !== undefined) {
        return this.multilang
      }
      return this.entitySchema.attributes[this.attributeName].isMultiLang
    },

    getType () {
      if (this.type !== undefined) {
        return this.type
      }
      const isNumber = numberTypes.includes(this.dataType)
      return isNumber ? 'number' : 'text'
    },

    model: {
      get () {
        return this.$store.state.data[this.attributeName]
      },

      set (value) {
        if (this.$v) {
          this.$v[this.attributeName].$touch()
        }
        this.$store.commit(`SET_DATA`, { key: this.attributeName, value })
      }
    }
  }
}
</script>

<docs>
Component will automaticly check data type by attribute name in entitySchema

### Basic usage

```vue
<template>
  <u-input attribute-name="caption" />
</template>
```

### When attribute type is number

```vue
<template>
  <u-input attribute-name="currencyValue" />
</template>
```

### Disabled

```vue
<template>
  <u-input
    attribute-name="caption"
    disabled
  />
</template>
```
</docs>
