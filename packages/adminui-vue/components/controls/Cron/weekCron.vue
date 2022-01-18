<template>
  <div class="week-cron">
    <span>Кожної(го)</span>
    <u-checkbox
      v-for="item in days"
      :key="item.id"
      v-model="item.value"
      :label="item.label"
    />
    <label for="">
      o
      <input
        v-model="curTime"
        type="time"
      >
      годині
    </label>
  </div>
</template>

<script>
export default {
  name: 'WeekCron',
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      days: [
        { id: '0', label: 'sun', value: false },
        { id: '1', label: 'mon', value: false },
        { id: '2', label: 'tue', value: false },
        { id: '3', label: 'wed', value: false },
        { id: '4', label: 'thu', value: false },
        { id: '5', label: 'fri', value: false },
        { id: '6', label: 'sat', value: false }
      ]
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
  }
}
</script>

<style>
.week-cron {
  display: flex;
  align-items: center;
}
</style>
