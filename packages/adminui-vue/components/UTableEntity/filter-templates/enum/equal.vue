<template>
  <form
    class="filter-section"
    @submit.prevent="$emit('search', {
      whereList: [{ condition, value }],
      description: $ut(condition) + ' ' + formattedValue
    })"
  >
    <u-select-enum
      v-model="value"
      class="filter-input"
      :e-group="eGroup"
      :placeholder="$ut('table.filter.valuePlaceholder')"
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
const Lookups = require('../../../../utils/lookups')

export default {
  name: 'FilterEnumEqual',

  props: {
    column: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      value: null,
      condition: 'equal'
    }
  },

  computed: {
    eGroup () {
      return this.column.attribute.enumGroup
    },

    formattedValue () {
      return Lookups.getEnumValue(this.eGroup, this.value)
    }
  }
}
</script>
