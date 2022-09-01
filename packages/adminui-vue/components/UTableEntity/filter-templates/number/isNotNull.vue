<template>
  <filter-template @submit="submitHandler"/>
</template>

<script>
export default {
  name: 'FilterNumberIsNotNull',

  components: {
    FilterTemplate: require('../../components/FilterTemplate.vue').default
  },

  mixins: [require('../mixinForFilter.js')],

  methods: {
    getCondition () {
      return {
        whereList: [{ condition: 'isNotNull' }],
        description: 'isNotNull'
      }
    }
  }
}
</script>
