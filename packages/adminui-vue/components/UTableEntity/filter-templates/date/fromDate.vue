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
      :placeholder="$ut('table.filter.date.valuePlaceholder')"
    />

    <u-button
      appearance="inverse"
      size="large"
      :disabled="value === null"
      type="submit"
      icon="el-icon-search"
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
