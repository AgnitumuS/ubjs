<template>
  <div>
    <label for="">
      Кожного
      <input
        v-model="data.day"
        type="number"
        min="1"
        max="31"
        step="1"
      > дня
    </label>
    <label for="">
      кожного
      <input
        v-model="data.month"
        type="number"
        min="1"
        max="11"
        step="1"
      >
      місяця о
    </label>
    <input
      v-model="curTime"
      type="time"
    >
  </div>
</template>

<script>
export default {
  name: 'MonthCron',
  props: {
    time: {
      type: String
    },
    day: {
      type: String
    },
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      dayValue: this.day
      //   curTime: this.time,
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
  watch: {
    dayValue (e) {
      console.log(e)
      this.$emit('input', e)
    },
    curTime (e) {
      this.$emit('input', e)
    }
  }
}
</script>

<style lang="scss" scoped></style>
