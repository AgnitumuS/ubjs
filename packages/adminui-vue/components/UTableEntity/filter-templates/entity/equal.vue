<template>
  <form
    class="filter-section"
    @submit.prevent="$emit('search', {
      whereList: [{ condition, value }],
      description: $ut(condition) + ' ' + formattedValue
    })"
  >
    <u-select-entity
      v-model="value"
      class="filter-input_value"
      remove-default-actions
      :entity-name="column.attribute.associatedEntity"
      :placeholder="$ut('table.filter.valuePlaceholder')"
      @input="onChange"
    />

    <u-button
      appearance="inverse"
      :disabled="value === null"
      type="submit"
      icon="u-icon-search"
    />
  </form>
</template>

<script>
export default {
  name: 'FilterEntityEqual',

  props: {
    column: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      value: null,
      condition: 'equal',
      formattedValue: ''
    }
  },

  methods: {
    onChange (ID, row) {
      let value = row.ID
      const entity = this.column.attribute.associatedEntity
      const entitySchema = entity ? this.$UB.connection.domain.get(entity) : {}
      const descriptionAttr = entitySchema.descriptionAttribute
      if (descriptionAttr && descriptionAttr in row) {
        value = row[descriptionAttr]
      } else if ('caption' in row) {
        value = row.caption
      } else if ('name' in row) {
        this.formattedValue = row.name
      }

      this.formattedValue = value
    }
  }
}
</script>
