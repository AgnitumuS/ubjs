<template>
  <div class="u-cron">
    <div class="u-cron__main">
      <URadio
        v-model="everyTimeValue"
        class="u-cron__sidebar"
        :items="everyTime"
      />
      <div class="u-cron__body">
        <keep-alive>
          <component
            :is="currentComponent"
            :item="everyTime.find((i) => i.id === everyTimeValue)"
            @change="changeHandler"
          />
        </keep-alive>
      </div>
    </div>

    <div class="u-cron__desc">
      <div>{{ cronString }}</div>
      <div>{{humanCronString}}</div>
    </div>
  </div>
</template>

<script>
// я не понимаю, каким другим способом можно подключить пакет установленый в adminui-pub
const cronstrue = require('../../../../adminui-pub/node_modules/cronstrue/i18n')

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
      everyTimeValue: 'day',
      everyTime: [
        { id: 'seconds', label: 'секунди', value: '*' },
        { id: 'minutes', label: 'хвилини', value: '*' },
        { id: 'hours', label: 'години', value: '*' },
        { id: 'day', label: 'день', value: '*' },
        { id: 'month', label: 'місяця', value: '*' },
        { id: 'week', label: 'дні тижня', value: '*' }
        // { id: 'year', label: 'року', value: '*' }
      ]
    }
  },
  computed: {
    currentComponent () {
      return this.everyTimeValue + 'Cron' || 'div'
    },
    cronString () {
      return this.everyTime.map((i) => i.value).join(' ')
    },
    humanCronString(){
      let str = ''
      try{
        str = cronstrue.toString(this.cronString, { locale: "uk" });
      } catch(err){
        console.log(err)
      } finally{

        return str
      }

    }
  },
  methods: {
    changeHandler (e) {
      const item = this.everyTime.find((i) => i.id === this.everyTimeValue)
      item.value = e
    }
  }
}
</script>

<style>
.u-cron__main {
  display: flex;
  margin-bottom: 12px;
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
