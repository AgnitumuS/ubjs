<template>
  <div class="u-cron">
    <div class="u-cron__desc">
      <div class="u-cron__desc--expresion">
        Cron expression: <span>{{ cronString }}</span>
      </div>
      <div class="u-cron__desc--txt">
        Interpretation: <span>{{ humanCronString }}</span>
      </div>
    </div>
    <div class="u-cron__main">
      <div class="u-cron__sidebar">
        <span
          v-for="(item, index) in everyTime"
          :key="index"
          class="u-cron__tab"
          :class="{ 'u-cron__tab-active': everyTimeValue === item.id }"
          @click="everyTimeValue = item.id"
        >{{ item.label }}</span>
      </div>
      <div class="u-cron__body">
        <keep-alive>
          <component
            :is="currentComponent"
            :item="everyTime.find((i) => i.id === everyTimeValue)"
            :locale="locale"
            @change="changeHandler"
          />
        </keep-alive>
      </div>
    </div>
  </div>
</template>

<script>
const cronstrue = require('@unitybase/adminui-pub').cronstrue

export default {
  name: 'Cron',
  components: {
    secondsCron: require('./secondsCron.vue').default,
    minutesCron: require('./minutesCron.vue').default,
    hoursCron: require('./hoursCron.vue').default,
    dayCron: require('./dayCron.vue').default,
    weekCron: require('./weekCron.vue').default,
    monthCron: require('./monthCron.vue').default
    // yearCron: require('./yearCron.vue').default
  },
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      everyTimeValue: 'day',
      everyTime: [
        { id: 'seconds', label: this.$ut('el.time.second'), value: '*' },
        { id: 'minutes', label: this.$ut('el.time.minute'), value: '*' },
        { id: 'hours', label: this.$ut('el.time.hour'), value: '*' },
        { id: 'day', label: this.$ut('el.time.day'), value: '*' },
        { id: 'month', label: this.$ut('el.time.month'), value: '*' },
        { id: 'week', label: this.$ut('el.time.dayOfWeek'), value: '*' }
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
    locale () {
      return window.$App.connection.userData('lang')
    },
    humanCronString () {
      return this.formatCronStrToHuman(this.cronString)
    }
  },
  watch: {
    humanCronString (newValue) {
      this.$emit('change', {
        cronString: this.cronString,
        humanString: newValue
      })
    }
  },
  created () {
    this.init(this.value)
  },
  methods: {
    formatCronStrToHuman (expression = '') {
      let str = ''
      const { locale } = this
      try {
        str = cronstrue.toString(expression, { locale })
      } catch (err) {
        console.log(err)
      } finally {
        return str
      }
    },
    init (cronStr = this.value) {
      if (!cronStr) return
      const value = cronStr.split(' ')
      value.reverse()
      const { everyTime } = this
      const length = everyTime.length - 1
      value.forEach((str, index) => {
        everyTime[length - index].value = str
      })
    },
    changeHandler (e) {
      const item = this.everyTime.find((i) => i.id === this.everyTimeValue)
      item.value = e
    }
  }
}
</script>

<style>
.u-cron {
  --cron-border: 1px solid hsl(var(--hs-border), var(--l-layout-border-default));
  padding: var(--padding) 0;
  border-top: var(--cron-border);
  border-bottom: var(--cron-border);
}
.u-cron__sidebar {
  display: flex;
  flex-direction: column;
  padding-right: calc(var(--padding) * 2);
}
.u-cron__tab.u-cron__tab-active {
  font-size: 500;
  color: white;
  background: hsl(var(--hs-primary), var(--l-state-default));
  border-radius: var(--border-radius);
}
.u-cron__tab {
  padding: var(--padding);
  cursor: pointer;
  text-transform: capitalize;
  white-space: nowrap;
}
.u-cron__main {
  display: flex;
  padding-top: var(--padding);
  border-top: var(--cron-border);
}
.u-cron__sidebar {
  padding-right: calc(var(--padding) * 2);
  margin-right: calc(var(--padding) * 2);
  border-right: var(--cron-border);
}
.u-cron__body .u-radio {
  margin-bottom: calc(var(--padding) * 2);
}
.u-cron__body .u-radio:last-child {
  margin-bottom: 0px;
}
.u-cron__body .u-radio--wrap {
  width: 100%;
}
.cron__start {
  display: flex;
}
.cron__start__item {
  margin-right: var(--padding);
}

.u-cron__body .u-radio__label {
  font-weight: 500;
}

.u-cron__desc {
  margin-bottom: var(--padding);
  font-size: calc(1em + 1px);
  font-weight: 500;
}
.u-cron__desc--txt span,
.u-cron__desc--expresion span {
  font-weight: normal;
  margin-left: var(--padding);
  font-style: italic;
}
.u-cron__desc--expresion {
  margin-bottom: var(--padding);
}
</style>
