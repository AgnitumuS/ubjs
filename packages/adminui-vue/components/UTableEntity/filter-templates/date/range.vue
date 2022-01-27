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
      return `${this.$ut('table.filter.date.from')} ${this.$moment(
        this.value[0]
      ).format('ll')} ${this.$ut('table.filter.date.to')} ${this.$moment(
        this.value[1]
      ).format('ll')}`
    },
    isEmpty () {
      return this.value === '' || this.value === null || this.value.length < 2
    }
  },

  methods: {
    addDay (date) {
      const moment = this.$moment(date)
      moment.add(1, 'day')
      return moment.toDate()
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
