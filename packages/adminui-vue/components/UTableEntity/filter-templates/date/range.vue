<template>
  <filter-template
    :button-disabled="value === null"
    @submit="$emit('search', {
      whereList: [
        { condition: 'moreEqual', value: value[0] },
        { condition: 'less', value: addDay(value[1]) }
      ],
      description
    })"
  >
    <u-date-picker
      v-model="value"
      type="daterange"
      range-separator="-"
      :start-placeholder="$ut('startDate')"
      :end-placeholder="$ut('endDate')"
      :picker-options="pickerOptions"
    />
  </filter-template>
</template>

<script>
export default {
  name: 'FilterDateRange',

  components: {
    FilterTemplate: require('../../components/FilterTemplate.vue').default
  },

  data () {
    return {
      value: null,
      pickerOptions: {
        shortcuts: [{
          text: this.$ut('today'),
          onClick: (picker) => {
            const end = this.$UB.truncTimeToUtcNull(new Date())
            const start = this.$UB.truncTimeToUtcNull(new Date())
            picker.$emit('pick', [start, end])
          }
        }, {
          text: this.$ut('yesterday'),
          onClick: (picker) => {
            const end = this.$UB.truncTimeToUtcNull(this.$moment().subtract(1, 'day').toDate())
            const start = this.$UB.truncTimeToUtcNull(this.$moment().subtract(1, 'day').toDate())
            picker.$emit('pick', [start, end])
          }
        }, {
          text: this.$ut('lastMonth'),
          onClick: (picker) => {
            const end = this.$UB.truncTimeToUtcNull(new Date())
            const start = this.$UB.truncTimeToUtcNull(this.$moment().subtract(1, 'month').toDate())
            picker.$emit('pick', [start, end])
          }
        }, {
          text: this.$ut('lastQuarter'),
          onClick: (picker) => {
            const end = this.$UB.truncTimeToUtcNull(new Date())
            const start = this.$UB.truncTimeToUtcNull(this.$moment().subtract(3, 'month').toDate())
            picker.$emit('pick', [start, end])
          }
        }, {
          text: this.$ut('last6Month'),
          onClick: (picker) => {
            const end = this.$UB.truncTimeToUtcNull(new Date())
            const start = this.$UB.truncTimeToUtcNull(this.$moment().subtract(6, 'month').toDate())
            picker.$emit('pick', [start, end])
          }
        }]
      }
    }
  },

  computed: {
    description () {
      return `${
        this.$ut('table.filter.date.from')
      } ${
        this.$moment(this.value[0]).format('ll')
      } ${
        this.$ut('table.filter.date.to')
      } ${
        this.$moment(this.value[1]).format('ll')
      }`
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
