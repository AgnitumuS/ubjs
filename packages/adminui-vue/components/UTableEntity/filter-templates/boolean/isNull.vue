<template>
  <form
    class="filter-section"
    @submit.prevent="$emit('search', {
      whereList: [{ condition: 'isNull' }],
      description: 'isNull'
    })"
  >
    <u-button
      size="large"
      appearance="inverse"
      type="submit"
      icon="el-icon-search"
    />
  </form>
</template>

<script>
export default {
  name: 'FilterBooleanIsNull'
}
</script>
