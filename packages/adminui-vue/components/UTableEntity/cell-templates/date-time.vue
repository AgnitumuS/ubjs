<template>
  <div>
    {{ displayValue }}
  </div>
</template>

<script>
const { mapGetters } = require('vuex')

export default {
  props: ['value'],

  computed: {
    ...mapGetters(['dateTimeFormat']),

    displayValue () {
      if (this.value instanceof Date) {
        return this.$moment(this.value).format(this.dateTimeFormat)
      } else {
        return this.value
      }
    }
  }
}
</script>
