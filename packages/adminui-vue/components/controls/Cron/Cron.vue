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
          :data="obj"
        />
      </div>
    </div>

    <div>{{ everyTimeValue }}</div>
  </div>
</template>

<script>
export default {
  name: 'Cron',
  components: {
    dayCron: require('./dayCron.vue').default,
    hoursCron: require('./hoursCron.vue').default,
    minutesCron: require('./minutesCron.vue').default,
    weekCron: require('./weekCron.vue').default,
    monthCron: require('./monthCron.vue').default,
    yearCron: require('./yearCron.vue').default
  },
  data () {
    return {
      everyTimeValue: 'day',
      everyTime: [
        { id: 'minutes', label: 'Кожної минути' },
        { id: 'hours', label: 'Кожної години' },
        { id: 'day', label: 'Кожний день' },
        { id: 'week', label: 'Кожного тижня' },
        { id: 'month', label: 'Кожного місяця' },
        { id: 'year', label: 'Кожного року' }
      ],
      obj: {
        minute: '00',
        hour: '00',
        day: '1',
        week: '1',
        month: '1',
        year: '1'
      }
    }
  },
  computed: {
    currentComponent () {
      return this.everyTimeValue + 'Cron' || 'div'
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
</style>
