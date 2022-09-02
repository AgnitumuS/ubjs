<template>
  <filter-template @submit="submitHandler" />
</template>

<script>
  export default {
    name: 'FilterDateNotIsNull',

    components: {
      FilterTemplate: require('../../components/FilterTemplate.vue').default
    },

    mixins: [require('../mixinForFilter.js')],

    methods: {
      getCondition () {
        return {
          whereList: [{ condition: 'notIsNull' }],
          description: 'notIsNull'
        }
      }
    }
  }
</script>
