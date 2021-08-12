<template>
  <el-input
    v-model="model"
    class="ub-input"
    :type="type"
    :step="step"
    :disabled="isDisabled || $attrs.disabled"
    v-bind="$attrs"
    @[numberEvent]="rounding"
  >
    <!-- @slot content as Input prefix -->
    <slot
      slot="prefix"
      name="prefix"
    />
    <!-- @slot content as Input suffix -->
    <slot
      slot="suffix"
      name="suffix"
    />
    <!-- @slot content to prepend before Input -->
    <slot
      slot="prepend"
      name="prepend"
    />
    <!-- @slot content to append after Input -->
    <slot
      slot="append"
      name="append"
    />
  </el-input>
</template>

<script>
/**
 * Input. For inputs of type="number", rounding precision and changing step (for up/down arrows) can be specified
 */
export default {
  name: 'UBaseInput',

  inject: {
    isDisabled: { from: 'isDisabled', default: false }
  },

  props: {
    /*
     * @model
     */
    value: {
      required: true
    },

    /**
     * a stepping interval to adjust the value using up/down keys
     * will be ignored if type !== 'number'
     */
    step: {
      type: [Number, String],
      default: 'any'
    },

    /**
     * rounding precision. Applied in case `type === 'number'` and `precision !== undefined`
     */
    precision: {
      type: Number,
      default: undefined
    },

    /**
     * input type. See [input types on MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#input_types)
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
