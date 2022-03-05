<template>
  <filter-template @submit="submitHandler" />
</template>

<script>
export default {
  name: 'FilterManyIsNull',

  components: {
    FilterTemplate: require('../../components/FilterTemplate.vue').default
  },
  
  mixins: [require('../mixinForFilter.js')],

  methods: {
    getCondition () {
      return {
        whereList: [{ condition: 'isNull' }],
        description: 'isNull'
      }
    }
  }
}
</script>
