<template>
  <form
    class="filter-section"
    @submit.prevent="$emit('search', {
      whereList: [{condition: 'moreEqual', value}],
      description: $ut('from_date') + ' ' + $moment(value).format('ll')
    })"
  >
    <el-date-picker
      v-model="value"
      type="date"
      :format="$ut('el').datepicker.format.date"
      :placeholder="$ut('table.filter.date.valuePlaceholder')"
      :picker-options="{ firstDayOfWeek: $ut('el.datepicker.format.firstDayOfWeek') }"
    />

    <u-button
      appearance="inverse"
      size="large"
      :disabled="value === null"
      type="submit"
      icon="u-icon-search"
    />
  </form>
</template>

<script>
export default {
  name: 'FilterDateFromDate',

  data () {
    return {
      value: null
    }
  }
}
</script>
