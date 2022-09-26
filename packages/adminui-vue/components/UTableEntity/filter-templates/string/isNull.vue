<template>
  <filter-template @submit="submitHandler" />
</template>

<script>
export default {
  name: 'FilterStringIsNull',
  components: {
    FilterTemplate: require('../../components/FilterTemplate.vue').default
  },

  mixins: [require('../mixinForFilter.js')],

  created () {
    this.$emit('search-disabled', false)
  },
  methods: {
    getCondition () {
      const { $ut } = this
      return {
        whereList: [{ condition: 'isNull' }],
        description: $ut('isNull')
      }
    }
  }
}
</script>
