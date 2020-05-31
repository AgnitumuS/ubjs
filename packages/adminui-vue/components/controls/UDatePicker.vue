<template>
  <el-date-picker
    type="date"
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
      return this.format || this.$ut('el').datepicker.format.date
    }
  }
}
</script>
