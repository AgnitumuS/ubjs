<template>
  <filter-template @submit="submitHandler" />
</template>

<script>
  export default {
    name: 'FilterBooleanIsFalse',

    components: {
      FilterTemplate: require('../../components/FilterTemplate.vue').default
    },

    mixins: [require('../mixinForFilter.js')],

    methods: {
      getCondition () {
        const { $ut } = this
        return {
          whereList: [{ condition: 'equal', value: false }],
          description: $ut('equal') + ' ' + $ut('No')
        }
      }
    }
  };
</script>
