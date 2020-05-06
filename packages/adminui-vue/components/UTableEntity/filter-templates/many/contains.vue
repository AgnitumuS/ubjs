<template>
  <form
    class="filter-section"
    @submit.prevent="$emit('search', {
      whereList: [{condition: 'in', value}],
      description: $ut('contains') + ' ' + manyOptions
    })"
  >
    <u-select-multiple
      ref="selectMany"
      v-model="value"
      :entity-name="column.attribute.associatedEntity"
      :placeholder="$ut('table.filter.valuePlaceholder')"
    />

    <u-button
      appearance="inverse"
      :disabled="value.length === 0"
      type="submit"
      icon="u-icon-search"
      size="large"
    />
  </form>
</template>

<script>
export default {
  name: 'FilterManyContains',

  props: {
    column: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      value: []
    }
  },

  computed: {
    manyOptions () {
      const selectMany = this.$refs.selectMany
      if (selectMany) {
        return selectMany.displayedOptions
          .map(o => o.label)
          .join(', ')
      } else {
        return []
      }
    }
  }
}
</script>
