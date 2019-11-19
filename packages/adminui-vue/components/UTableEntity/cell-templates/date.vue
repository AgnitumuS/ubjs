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
    ...mapGetters(['dateFormat']),

    displayValue () {
      if (this.value instanceof Date) {
        return this.$moment(this.value).format(this.dateFormat)
      } else {
        return this.value
      }
    }
  }
}
</script>
