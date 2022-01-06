<template>
  <filter-template @submit="submitHandler" />
</template>

<script>
export default {
  name: 'FilterBooleanIsTrue',

  components: {
    FilterTemplate: require('../../components/FilterTemplate.vue').default
  },
  methods: {
    getCondition() {
      const { $ut } = this
        return {
          whereList: [{ condition: 'equal', value: true }],
          description: $ut('equal') + ' ' + $ut('Yes')
        }
    },
    submitHandler() {
      this.$emit('search', this.getCondition())
    }
  }
}
</script>
