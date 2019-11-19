<template>
  <div>
    {{ displayValue }}
  </div>
</template>

<script>
const Lookups = require('../../../utils/lookups.js')

export default {
  props: ['value', 'column'],

  computed: {
    displayValue  () {
      if (this.column.isLookup) {
        return Lookups.getValueById(this.column.attribute.associatedEntity, this.value)
      } else {
        return this.value
      }
    }
  }
}
</script>
