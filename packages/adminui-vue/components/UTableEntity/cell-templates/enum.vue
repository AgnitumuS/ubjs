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
      if (this.column.isLookup && this.value !== null) {
        return Lookups.getEnumValue(this.column.attribute.enumGroup, this.value)
      } else {
        return this.value
      }
    }
  }
}
</script>
