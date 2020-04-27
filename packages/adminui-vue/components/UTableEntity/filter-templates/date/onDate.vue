<template>
  <form
    class="filter-section"
    @submit.prevent="$emit('search', {
      whereList: [
        { condition: 'moreEqual', value },
        { condition: 'less', value: addDay(value) }
      ],
      description: $ut('date') + ' ' + $moment(value).format('ll')
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
      icon="u-icon-search"
      size="large"
    />
  </form>
</template>

<script>
export default {
  name: 'FilterDateOnDate',

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
