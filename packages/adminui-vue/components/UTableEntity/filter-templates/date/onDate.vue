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
    <u-date-picker
      v-model="value"
      class="filter-input_value"
      type="date"
      :placeholder="$ut('table.filter.date.valuePlaceholder')"
    />

    <u-button
      appearance="inverse"
      :disabled="value === null"
      type="submit"
      icon="u-icon-search"
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
