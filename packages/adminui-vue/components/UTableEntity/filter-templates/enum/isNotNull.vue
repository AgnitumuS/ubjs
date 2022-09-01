<template>
  <filter-template @submit="submitHandler"/>
</template>

<script>
export default {
  name: 'FilterEnumIsNotNull',

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
