<template>
  <filter-template
    @submit="$emit('search', {
      whereList: [{ condition: 'isNotNull' }],
      description: 'isNotNull'
    })"
  />
</template>

<script>
export default {
  name: 'FilterStringIsNotNull',

  components: {
    FilterTemplate: require('../../components/FilterTemplate.vue').default
  }
}
</script>
