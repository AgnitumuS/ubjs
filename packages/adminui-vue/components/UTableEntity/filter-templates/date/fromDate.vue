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
  name: 'FilterDateFromDate',

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
    getCondition () {
      const { value, $ut } = this
      return {
        whereList: [{ condition: 'moreEqual', value }],
        description: $ut('from_date') + ' ' + this.$UB.formatter.formatDate(value, 'date')
      }
    }
  }
}
</script>
