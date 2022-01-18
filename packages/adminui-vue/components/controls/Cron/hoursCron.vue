<template>
  <div>
    <label for="">
      О:
      <input
        v-model="data.minute"
        type="number"
        min="1"
        max="59"
        step="1"
      >
      хвилині
    </label>
    <label for="">
      кожної
      <input
        v-model="data.hour"
        type="number"
        min="1"
        max="23"
        step="1"
      >
      години
    </label>
  </div>
</template>

<script>
export default {
  name: 'HoursCron',
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  created () {
    if (!parseFloat(this.data.minute) || Number.isNaN(this.data.minute)) this.data.minute = '1'
    if (!parseFloat(this.data.hour) || Number.isNaN(this.data.hour)) this.data.hour = '1'
  }
}
</script>

<style lang="scss"></style>
