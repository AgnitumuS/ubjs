<template>
  <filter-template
    :button-disabled="value === null"
    @submit="submitHandler"
  >
    <u-date-picker
      v-model="value"
      :placeholder="$ut('table.filter.date.valuePlaceholder')"
      type="date"
    />
  </filter-template>
</template>

<script>
export default {
  name: 'FilterDateOnDate',

  components: {
    FilterTemplate: require('../../components/FilterTemplate.vue').default
  },

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
    },
    getCondition() {
      const { $ut, value, $moment, addDay } = this
        return {
          whereList: [
            { condition: 'moreEqual', value },
            { condition: 'less', value: addDay(value) }
          ],
          description: $ut('date') + ' ' + $moment(value).format('ll')
        }
    },
    submitHandler() {
      this.$emit('search', this.getCondition())
    }
  }
}
</script>
