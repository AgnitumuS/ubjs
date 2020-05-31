<template>
  <form
    class="filter-section"
    @submit.prevent="$emit('search', {
      whereList: [{ condition: 'equal', value: false }],
      description: $ut('equal') + ' ' + $ut('No')
    })"
  >
    <u-button
      appearance="inverse"
      size="large"
      type="submit"
      icon="u-icon-search"
    />
  </form>
</template>

<script>
export default {
  name: 'FilterBooleanIsFalse'
}
</script>
