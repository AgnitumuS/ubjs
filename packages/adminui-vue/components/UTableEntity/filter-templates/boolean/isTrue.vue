<template>
  <filter-template @submit="submitHandler" />
</template>

<script>
export default {
  name: 'FilterBooleanIsTrue',

  components: {
    FilterTemplate: require('../../components/FilterTemplate.vue').default
  },

  mixins: [require('../mixinForFilter.js')],

  methods: {
    getCondition() {
      const { $ut } = this
        return {
          whereList: [{ condition: 'equal', value: true }],
          description: $ut('equal') + ' ' + $ut('Yes')
        }
    },
  }
}
</script>
