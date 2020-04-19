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
      icon="el-icon-search"
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
      this.formattedValue = row[this.column.attribute.entity.getDescriptionAttribute()]
    }
  }
}
</script>
