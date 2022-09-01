<template>
  <filter-template @submit="submitHandler"/>
</template>

<script>
export default {
  name: 'FilterStringIsNotNull',
  components: {
    FilterTemplate: require('../../components/FilterTemplate.vue').default
  },

  mixins: [require('../mixinForFilter.js')],

  created () {
    this.$emit('search-disabled', false)
  },
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
