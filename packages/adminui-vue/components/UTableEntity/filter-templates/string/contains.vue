<template>
  <form
    class="filter-section"
    @submit.prevent="$emit('search', {
      whereList: [{ condition, value }],
      description: $ut(condition) + ' ' + value
    })"
  >
    <el-input
      v-model="value"
      :placeholder="$ut('table.filter.valuePlaceholder')"
      class="filter-input"
    />
    <u-button
      appearance="inverse"
      :disabled="isEmpty"
      type="submit"
      icon="el-icon-search"
      size="large"
    />
  </form>
</template>

<script>
export default {
  name: 'FilterStringContains',

  data () {
    return {
      value: '',
      condition: 'contains'
    }
  },

  computed: {
    isEmpty () {
      return this.value === '' || this.value === null
    }
  }
}
</script>
