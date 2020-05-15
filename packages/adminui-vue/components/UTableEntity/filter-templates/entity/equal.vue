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
      class="filter-input"
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
      size="large"
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
      const entity = this.column.attribute.entity || {}
      const descriptionAttr = entity.descriptionAttribute
      if (descriptionAttr) {
        this.formattedValue = row[descriptionAttr]
        return
      }

      if ('caption' in entity.attributes) {
        this.formattedValue = row.caption
        return
      }

      if ('name' in entity.attributes) {
        this.formattedValue = row.name
        return
      }

      this.formattedValue = row.ID
    }
  }
}
</script>
