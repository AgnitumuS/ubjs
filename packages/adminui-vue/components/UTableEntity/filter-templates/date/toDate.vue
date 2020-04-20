<template>
  <form
    class="filter-section"
    @submit.prevent="$emit('search', {
      whereList: [{ condition: 'less', value: addDay(value) }],
      description: $ut('to_date') + ' ' + $moment(addDay(value)).format('ll')
    })"
  >
    <el-date-picker
      v-model="value"
      type="date"
      :placeholder="$ut('table.filter.date.valuePlaceholder')"
    />

    <u-button
      appearance="inverse"
      :disabled="value === null"
      type="submit"
      icon="el-icon-search"
      size="large"
    />
  </form>
</template>

<script>
export default {
  name: 'FilterDateToDate',

  data () {
    return {
      value: null
    }
  },

  methods: {
    addDay (date) {
      const moment = this.$moment(date)
      moment.add(1, 'day')
      return moment.toDate()
    }
  }
}
</script>
