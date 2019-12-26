<template>
  <el-input
    v-model="model"
    class="ub-input"
    :type="type"
    :step="step"
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
      type: Number,
      default: 1
    },

    /**
     * rounding precision.
     * accepts only integers.
     * will be ignored if type !== 'number'
     */
    precision: {
      type: Number,
      default: 0
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

        if (this.type === 'number') {
          this.$emit('input', +value)
        } else {
          this.$emit('input', value)
        }
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
