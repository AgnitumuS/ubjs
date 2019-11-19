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
      if (this.column.isLookup && this.value) {
        return this.value.toString()
          .split(',')
          .map(id => {
            return Lookups.getValueById(this.column.attribute.associatedEntity, Number(id))
          })
          .join(', ')
      } else {
        return this.value
      }
    }
  }
}
</script>
