<template>
  <form
    class="filter-section"
    @submit.prevent="$emit('search', {
      whereList: [{condition: 'notIn', value}],
      description: $ut('notContains') + ' ' + manyOptions
    })"
  >
    <u-select-multiple
      ref="selectMany"
      v-model="value"
      value-attribute="code"
      :repository="repository"
      :placeholder="$ut('table.filter.valuePlaceholder')"
      class="filter-input_value"
    />

    <u-button
      appearance="inverse"
      :disabled="value.length === 0"
      type="submit"
      icon="u-icon-search"
    />
  </form>
</template>

<script>
export default {
  name: 'FilterEnumNotContains',

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
  },

  methods: {
    repository () {
      return this.$UB.Repository('ubm_enum')
        .attrs('code', 'name', 'eGroup')
        .where('eGroup', '=', this.column.attribute.enumGroup)
    }
  }
}
</script>
