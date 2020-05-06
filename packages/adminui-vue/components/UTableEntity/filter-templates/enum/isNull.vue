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
      size="large"
    />
  </form>
</template>

<script>
export default {
  name: 'FilterEnumIsNull'
}
</script>
