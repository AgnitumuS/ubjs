<template>
  <filter-template @submit="submitHandler" />
</template>

<script>
  export default {
    name: 'FilterBooleanIsFalse',

    components: {
      FilterTemplate: require('../../components/FilterTemplate.vue').default
    },
    methods: {
      getCondition () {
        const { $ut } = this
        return {
          whereList: [{ condition: 'equal', value: false }],
          description: $ut('equal') + ' ' + $ut('No')
        }
      },
      submitHandler () {
        this.$emit('search', this.getCondition())
      }
    }
  };
</script>
