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
  name: 'FilterDateFromDate',

  components: {
    FilterTemplate: require('../../components/FilterTemplate.vue').default
  },

  data () {
    return {
      value: null
    }
  },
  methods: {
    getCondition() {
      const { value, $ut, $moment } = this
        return {
          whereList: [{condition: 'moreEqual', value}],
          description: $ut('from_date') + ' ' + $moment(value).format('ll')
        }
    },
    submitHandler() {
      this.$emit('search', this.getCondition())
    }
  }
}
</script>
