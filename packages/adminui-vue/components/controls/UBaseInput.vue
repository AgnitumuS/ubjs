<template>
  <el-input
    v-model="model"
    class="ub-input"
    :type="type"
    :step="step"
    :disabled="isDisabled"
    v-bind="$attrs"
    @[numberEvent]="rounding"
  >
    <slot
      slot="prefix"
      name="prefix"
    />
    <slot
      slot="suffix"
      name="suffix"
    />
    <slot
      slot="prepend"
      name="prepend"
    />
    <slot
      slot="append"
      name="append"
    />
  </el-input>
</template>

<script>
/**
* when using type="number", helps to establish the precision of rounding and step
*/

export default {
  name: 'UBaseInput',

  inject: ['isDisabled'],

  props: {
    /*
     * @model
     */
    value: {
      required: true
    },

    /**
     * a stepping interval to use when using up and down arrows to adjust the value.
     * will be ignored if type !== 'number'
     */
    step: {
      type: [Number, String],
      default: 'any'
    },

    /**
     * rounding precision. Applied in case `type !== 'number'` and `precision !== undefined`
     */
    precision: {
      type: Number,
      default: undefined
    },

    /**
     * input type
     */
    type: {
      type: String,
      default: 'text'
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

        this.$emit('input', value)
      }
    },

    numberEvent () {
      return (this.type === 'number') ? 'change' : null
    }
  },

  methods: {
    rounding (value) {
      if (value === null || value === '') {
        return null
      }
      if (this.type !== 'number') {
        return value
      }
      let asNumber = Number(value)
      if (this.precision !== undefined) {
        const preciseness = 10 ** this.precision
        asNumber = Math.round((asNumber * preciseness)) / preciseness
      }
      this.$emit('input', asNumber)
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
