<template>
  <form
    class="filter-section"
    @submit.prevent="$emit('search', {
      whereList: [{ condition: 'isNull' }],
      description: 'isNull'
    })"
  >
    <u-button
      appearance="inverse"
      type="submit"
      icon="u-icon-search"
    />
  </form>
</template>

<script>
export default {
  name: 'FilterEntityIsNull'
}
</script>
