<template>
  <div>
    <label
      for=""
    >Кожного:
      <input
        v-model="data.day"
        type="number"
        min="1"
        max="31"
        step="1"
      > дня о
    </label>
    <input
      v-model="curTime"
      type="time"
    >
  </div>
</template>

<script>
export default {
  name: 'DayCron',
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    curTime: {
      get () {
        return this.data.minute + ':' + this.data.hour
      },
      set (e) {
        const z = e.split(':')
        this.data.minute = z[0]
        this.data.hour = z[1]
      }
    }
  },
  created () {
    if (!parseFloat(this.data.minute) || Number.isNaN(this.data.minute)) {
      this.data.minute = '1'
    }
    if (!parseFloat(this.data.hour) || Number.isNaN(this.data.hour)) {
      this.data.hour = '1'
    }
    if (!parseFloat(this.data.day) || Number.isNaN(this.data.day)) {
      this.data.day = '1'
    }
  }
}
</script>

<style lang="scss" scoped></style>
