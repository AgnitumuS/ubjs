<template>
  <div class="u-cron">
    <div class="u-cron__main">
      <URadio
        v-model="everyTimeValue"
        class="u-cron__sidebar"
        :items="everyTime"
      />
      <div class="u-cron__body">
        <component
          :is="currentComponent"
          :data="obj[everyTimeValue]"
        />
      </div>
    </div>

    <div>{{ cronString }}</div>
  </div>
</template>

<script>
export default {
  name: 'Cron',
  components: {
    secondsCron: require('./secondsCron.vue').default,
    minutesCron: require('./minutesCron.vue').default,
    hoursCron: require('./hoursCron.vue').default,
    dayCron: require('./dayCron.vue').default,
    weekCron: require('./weekCron.vue').default,
    monthCron: require('./monthCron.vue').default,
    yearCron: require('./yearCron.vue').default
  },
  data () {
    return {
      everyTimeValue: 'seconds',
      everyTime: [
        { id: 'seconds', label: 'секунди' },
        { id: 'minutes', label: 'хвилини' },
        { id: 'hours', label: 'години' },
        { id: 'day', label: 'день' },
        { id: 'week', label: 'тижня' },
        { id: 'month', label: 'місяця' },
        { id: 'year', label: 'року' }
      ],
      obj: {
        seconds: {
          every: true,
          start: '0',
          specify: '0',
          between: [],
          value: 'specify'
        }
        // minute: '00',
        // hour: '00',
        // day: '1',
        // week: '1',
        // month: '1',
        // year: '1'
      }
    }
  },
  computed: {
    currentComponent () {
      return this.everyTimeValue + 'Cron' || 'div'
    },
    cronString () {
      return this.getCronString()
    }
  },
  watch: {
    everyTimeValue (e) {
      console.log(e)
    },
    obj: {
      deep: true,
      handler (e) {
        console.log(e)
      }
    }
  },
  methods: {
    getCronString (data = this.obj) {
      return 'sdf'
    }
  }
}
</script>

<style>
.u-cron__main {
  display: flex;
}
.u-cron__sidebar {
  padding-right: 24px;
  margin-right: 24px;
  border-right: 1px solid;
}
.u-cron__body .u-radio {
  margin-bottom: 24px;
}
.u-cron__body .u-radio--wrap {
  width: 100%;
}
.cron__start {
  display: flex;
}
.cron__start__item {
  margin-right: 8px;
}

.u-cron__body .u-radio__label {
  font-weight: 500;
}
</style>
