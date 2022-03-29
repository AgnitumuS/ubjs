<template>
  <div class="u-cron">
    <div class="u-cron__desc">
      <div class="u-cron__desc--expresion">
        {{ $ut('UCron.expression') }}: <span>{{ cronString }}</span>
      </div>
      <div class="u-cron__desc--txt">
        {{ $ut('UCron.interpretation') }}: <span>{{ humanCronString }}</span>
      </div>
    </div>
    <div class="u-cron__main">
      <div class="u-cron__sidebar">
        <span
          v-for="(item, index) in everyTime"
          v-show="item.visible"
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
            @change="changeHandler"
          />
        </keep-alive>
      </div>
    </div>
  </div>
</template>

<script>
/* global $App */
const ubPubAvailable = typeof $App !== 'undefined' // not available for UIDoc

const defaultProp = {
  visible: true,
  value: '*'
}

export default {
  name: 'UCron',
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
    /**
     * Cron expression
     */
    value: {
      type: String,
      default: ''
    },
    /**
     * visible {boolean} - display in the list
     * value {string} - default value for this part of cron
     */
    seconds: {
      type: Object,
      default: () => defaultProp
    },
    minutes: {
      type: Object,
      default: () => defaultProp
    },
    hours: {
      type: Object,
      default: () => defaultProp
    },
    day: {
      type: Object,
      default: () => defaultProp
    },
    month: {
      type: Object,
      default: () => defaultProp
    },
    week: {
      type: Object,
      default: () => defaultProp
    }
  },
  data () {
    return {
      everyTimeValue: 'day',
      everyTime: [
        {
          id: 'seconds',
          label: this.$ut('UCron.second'),
          value: this.seconds.value || '*',
          visible:
            this.seconds.visible === undefined ? true : this.seconds.visible
        },
        {
          id: 'minutes',
          label: this.$ut('UCron.minute'),
          value: this.minutes.value || '*',
          visible:
            this.minutes.visible === undefined ? true : this.minutes.visible
        },
        {
          id: 'hours',
          label: this.$ut('UCron.hour'),
          value: this.hours.value || '*',
          visible: this.hours.visible === undefined ? true : this.hours.visible
        },
        {
          id: 'day',
          label: this.$ut('UCron.day'),
          value: this.day.value || '*',
          visible: this.day.visible === undefined ? true : this.day.visible
        },
        {
          id: 'month',
          label: this.$ut('UCron.month'),
          value: this.month.value || '*',
          visible: this.month.visible === undefined ? true : this.month.visible
        },
        {
          id: 'week',
          label: this.$ut('UCron.dayOfWeek'),
          value: this.week.value || '*',
          visible: this.week.visible === undefined ? true : this.week.visible
        }
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
    humanCronString () {
      return ubPubAvailable
        ? $App.verbaliseCronExpression(this.cronString)
        : this.cronString
    }
  },
  watch: {
    humanCronString (newValue) {
      /**
       * Triggers when the user change state of radio
       *
       * @param {object} newValue includes new cron expression and human-readable string
       */
      this.$emit('change', {
        cronString: this.cronString,
        humanString: newValue
      })
    }
  },
  async created () {
    this.init(this.value)
    if (ubPubAvailable) {
      await $App.verbaliseCronExpression.init() // lazy load cronstrue
    }
  },
  methods: {
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
  font-weight: 500;
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