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
      size="large"
      icon="el-icon-search"
    />
  </form>
</template>

<script>
export default {
  name: 'FilterDateIsNull'
}
</script>
