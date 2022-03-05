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
      const d = new Date(date)
      d.setDate(d.getDate() + 1) // add 1 day
      return d
    },
    getCondition () {
      const { $ut, value, addDay } = this
      return {
        whereList: [
          { condition: 'moreEqual', value },
          { condition: 'less', value: addDay(value) }
        ],
        description: $ut('date') + ' ' + this.$UB.formatter.formatDate(value, 'date')
      }
    }
  }
}
</script>
