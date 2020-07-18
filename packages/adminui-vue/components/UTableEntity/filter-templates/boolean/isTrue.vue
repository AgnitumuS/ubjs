<template>
  <form
    class="filter-section"
    @submit.prevent="$emit('search', {
      whereList: [{ condition: 'equal', value: true }],
      description: $ut('equal') + ' ' + $ut('Yes')
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
  name: 'FilterBooleanIsTrue'
}
</script>
