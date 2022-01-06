<template>
  <filter-template @submit="submitHandler" />
</template>

<script>
export default {
  name: 'FilterDateIsNull',

  components: {
    FilterTemplate: require('../../components/FilterTemplate.vue').default
  },
  methods: {
    getCondition() {
      return {
        whereList: [{ condition: 'isNull' }],
        description: 'isNull'
      }
    },
    submitHandler() {
      this.$emit('search', this.getCondition())
    }
  }
}
</script>
