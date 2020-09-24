<template>
  <el-date-picker
    :type="type"
    :class="pickerClass"
    :value="value"
    :format="dateFormat"
    :picker-options="mergedPickerOptions"
    v-bind="$attrs"
    v-on="$listeners"
  />
</template>

<script>
/**
 * Wrap for ElDatePicker.
 * Has same props but compute correct date format and first day of the week.
 * Will be rewritten to a custom component in the future.
 */
export default {
  name: 'UDatePicker',

  props: {
    value: {},

    format: String,

    type: {
      type: String,
      default: 'date'
    },

    pickerOptions: {
      type: Object,
      default: () => ({})
    }
  },

  computed: {
    mergedPickerOptions () {
      return {
        firstDayOfWeek: this.$ut('el.datepicker.format.firstDayOfWeek'),
        ...this.pickerOptions
      }
    },

    dateFormat () {
      if (this.format) {
        return this.format
      }

      return this.$ut('el').datepicker.format[this.type] || ''
    },

    pickerClass () {
      return 'u-date-picker__' + this.type
    }
  }
}
</script>

<style>

.u-date-picker__date {
  width: 160px !important;
}

</style>
