<template>
  <form
    class="filter-section"
    @submit.prevent="$emit('search', {
      whereList: [{ condition, value }],
      description: $ut(condition) + ' ' + value
    })"
  >
    <u-base-input
      v-model="value"
      :placeholder="$ut('table.filter.valuePlaceholder')"
      class="filter-input-number"
      type="number"
    />

    <u-button
      appearance="inverse"
      :disabled="isEmpty"
      type="submit"
      icon="u-icon-search"
    />
  </form>
</template>

<script>
export default {
  name: 'FilterNumberLess',

  data () {
    return {
      value: null,
      condition: 'less'
    }
  },

  computed: {
    isEmpty () {
      return this.value === '' || this.value === null
    }
  }
}
</script>
