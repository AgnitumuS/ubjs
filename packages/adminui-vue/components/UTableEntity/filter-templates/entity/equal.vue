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
      const e = this.column.attribute.entity
      let da = e.descriptionAttribute
      if (!da && e.attributes.caption) {
        da = 'caption'
      } else if (!da && e.attributes.name) {
        da = 'name'
      } else {
        da = 'ID'
      }
      this.formattedValue = row[da]
    }
  }
}
</script>
