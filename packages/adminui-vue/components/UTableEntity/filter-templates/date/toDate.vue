<template>
  <filter-template
    :button-disabled="value === null"
    @submit="submitHandler"
  >
    <u-date-picker
      v-model="value"
      type="date"
      :placeholder="$ut('table.filter.date.valuePlaceholder')"
    />
  </filter-template>
</template>

<script>
export default {
  name: 'FilterDateToDate',

  components: {
    FilterTemplate: require('../../components/FilterTemplate.vue').default
  },

  mixins: [require('../mixinForFilter.js')],

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
          whereList: [{ condition: 'less', value: addDay(value) }],
          description: $ut('to_date') + ' ' + $moment(addDay(value)).format('ll')
        }
    }
  }
}
</script>
