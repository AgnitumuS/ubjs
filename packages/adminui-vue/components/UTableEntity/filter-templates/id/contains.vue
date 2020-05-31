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
      class="filter-input_value"
      :min="0"
      type="number"
    />

    <u-button
      appearance="inverse"
      :disabled="isEmpty"
      type="submit"
      icon="u-icon-search"
      size="large"
    />
  </form>
</template>

<script>
export default {
  name: 'FilterIdContains',

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
