<template>
  <filter-template @submit="submitHandler" />
</template>

<script>
export default {
  name: 'FilterEnumNotIsNull',

  components: {
    FilterTemplate: require('../../components/FilterTemplate.vue').default
  },

  mixins: [require('../mixinForFilter.js')],

  methods: {
    getCondition () {
      const { $ut } = this
      return {
        whereList: [{ condition: 'notIsNull' }],
        description: $ut('notIsNull')
      }
    }
  }
}
</script>
