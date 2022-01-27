<template>
  <filter-template
    :button-disabled="isEmpty"
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

  mixins: [require('../mixinForFilter.js')],

  data () {
    return {
      value: null
    }
  },
  computed: {
    isEmpty () {
      return this.value === '' || this.value === null
    }
  },

  created () {
    if (Array.isArray(this.value)) this.value = this.value[0]
  },

  methods: {
    addDay (date) {
      const moment = this.$moment(date)
      moment.add(1, 'day')
      return moment.toDate()
    },
    getCondition () {
      const { $ut, value, $moment, addDay } = this
      return {
        whereList: [
          { condition: 'moreEqual', value },
          { condition: 'less', value: addDay(value) }
        ],
        description: $ut('date') + ' ' + $moment(value).format('ll')
      }
    }
  }
}
</script>
