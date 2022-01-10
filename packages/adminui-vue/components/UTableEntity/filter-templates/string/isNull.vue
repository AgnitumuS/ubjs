<template>
  <filter-template @submit="submitHandler" />
</template>

<script>
export default {
  name: 'FilterStringIsNull',
  components: {
    FilterTemplate: require('../../components/FilterTemplate.vue').default
  },
  created(){
        this.$emit('search-disabled', false)
  },
  methods: {
    getCondition () {
      return {
        whereList: [{ condition: 'isNull' }],
        description: 'isNull'
      }
    },
    submitHandler () {
      this.$emit('search', this.getCondition())
    }
  }
}
</script>
