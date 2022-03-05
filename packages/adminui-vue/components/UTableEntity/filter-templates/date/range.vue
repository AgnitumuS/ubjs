<template>
  <filter-template
    :button-disabled="isEmpty"
    @submit="submitHandler"
  >
    <u-date-picker
      v-model="value"
      type="daterange"
    />
  </filter-template>
</template>

<script>
export default {
  name: 'FilterDateRange',

  components: {
    FilterTemplate: require('../../components/FilterTemplate.vue').default
  },

  mixins: [require('../mixinForFilter.js')],

  data () {
    return {
      value: null
    }
  },

  computed: {
    description () {
      const iFr = this.$ut('table.filter.date.from')
      const iTo = this.$ut('table.filter.date.to')
      return `${iFr} ${this.$UB.formatter.formatDate(this.value[0], 'date')} ${iTo} ${this.$UB.formatter.formatDate(this.value[1], 'date')}`
    },
    isEmpty () {
      return this.value === '' || this.value === null || this.value.length < 2
    }
  },

  methods: {
    addDay (date) {
      const d = new Date(date)
      d.setDate(d.getDate() + 1) // add 1 day
      return d
    },
    getCondition () {
      const { value, addDay, description } = this
      return {
        whereList: [
          { condition: 'moreEqual', value: value[0] },
          { condition: 'less', value: addDay(value[1]) }
        ],
        description
      }
    }
  }
}
</script>
