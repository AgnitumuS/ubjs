<template>
  <div class="u-cron">
    <div class="u-cron__desc">
      <div>
        <strong>{{ $ut('UCron.expression') }}:</strong>
        <span
          v-for="(p, i) in valueParts"
          :key="i"
          class="u-cron__desc-part"
          :title="$ut('UCron.'+sections[i].id)"
          @click="activeSectionName=sections[i].id"
        >
          {{ p }}
        </span>
      </div>
      <div>
        <strong>{{ $ut('UCron.interpretation') }}:</strong> {{ humanCronString }}
      </div>
      <div>
        <strong>{{ $ut('UCron.estimate') }}(5):</strong> {{ estimateStr }}
      </div>
    </div>
    <div class="u-cron__main">
      <div class="u-cron__sidebar">
        <span
          v-for="(item, index) in sections"
          v-show="visibleSectionsMap.has(item.id)"
          :key="index"
          class="u-cron__tab"
          :class="{ 'u-cron__tab-active': activeSectionName === item.id }"
          @click="activeSectionName = item.id"
        >{{ $ut('UCron.' + item.id) }}</span>
      </div>
      <div class="u-cron__body">
        <keep-alive>
          <component
            :is="activeSectionComponent"
            :value="fieldValues[activeSection.index]"
            @change="doOnCronFieldChange"
          >
          </component>
        </keep-alive>
      </div>
    </div>
  </div>
</template>

<script>
/* global $App */
const ubPubAvailable = typeof $App !== 'undefined' // not available for UIDoc

const CRON_PARTS = ['second', 'minute', 'hour', 'day', 'month', 'dayOfWeek', 'occurrence']

export default {
  name: 'UCron',
  components: {
    UCronField: require('./UCronField.vue').default,
    UCronSecond: require('./UCronSecond.vue').default,
    UCronMinute: require('./UCronMinute.vue').default,
    UCronHour: require('./UCronHour.vue').default,
    UCronDay: require('./UCronDay.vue').default,
    UCronMonth: require('./UCronMonth.vue').default,
    UCronDayOfWeek: require('./UCronDayOfWeek.vue').default,
    UCronOccurrence: require('./UCronOccurrence.vue').default
  },
  props: {
    /**
     * Cron expression
     */
    value: {
      type: String,
      default: '0 0 0 * * *'
    },
    /**
     * Array of hidden sections. By default, non-standard `occurrence` section is hidden
     *
     * @values second, minute, hour, day, month, dayOfWeek, occurrence
     */
    hideSections: {
      type: Array,
      default: () => ['occurrence'],
      validator: function (v) { return v.every(v => CRON_PARTS.includes(v)) }
    }
  },
  data () {
    const initialData = this.value.split(' ')
    while (initialData.length < CRON_PARTS.length) initialData.push('')
    return {
      activeSectionName: 'day',
      fieldValues: initialData,
      estimateStr: '',
      humanCronString: initialData
    }
  },
  computed: {
    visibleSectionsMap () {
      const result = new Set(CRON_PARTS)
      this.hideSections.forEach(s => result.delete(s))
      return result
    },
    activeSection () {
      return this.sections.find(s => s.id === this.activeSectionName)
    },
    activeSectionComponent () {
      return 'UCron' + this.activeSection.id.charAt(0).toUpperCase() + this.activeSection.id.slice(1)
    },
    sections () {
      return CRON_PARTS.map((p, idx) => {
        return {
          index: idx,
          id: p
        }
      })
    },
    valueParts () {
      return this.value.split(' ')
    }
  },
  watch: {
    value (newCron, oldCron) {
      if (newCron !== oldCron) {
        this.updateParts(newCron)
      }
    }
  },
  mounted () {
    this.updateParts(this.value)
  },
  async created () {
    if (ubPubAvailable) {
      await $App.verbaliseCronExpression.init() // lazy load cronstrue
    }
  },
  methods: {
    updateParts (cronStr) {
      if (!cronStr) return
      const parts = cronStr.split(' ')
      for (let i = 0, L = CRON_PARTS.length; i < L; i++) { // iterate all possible parts
        const v = parts[i] || ''
        if (this.fieldValues[i] !== v) {
          this.fieldValues[i] = v
        }
      }
      this.humanCronString = ubPubAvailable ? $App.verbaliseCronExpression(cronStr) : cronStr
      this.refreshEstimate(cronStr)
    },

    doOnCronFieldChange (e) {
      this.fieldValues[this.activeSection.index] = e
      const newValue = this.fieldValues.join(' ').trim()
      this.$emit('input', newValue)
    },

    async refreshEstimate (cronExpression) {
      if (!ubPubAvailable) {
        this.estimateStr = '-'
        return
      }

      try {
        const estimate = await this.$UB.connection.run({
          entity: 'ubq_scheduler',
          method: 'estimateCronSchedule',
          cronExpression,
          cnt: 5
        })
        this.estimateStr = estimate.dates.map(d => this.$UB.formatter.formatDate(d, 'dateTimeFull')).join(' -> ')
      } catch {
        this.estimateStr = '-'
      }
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

.u-cron__desc {
  margin: 0 var(--padding) var(--padding) var(--padding);
  line-height: 1.7em;
}

.u-cron-field .u-radio {
  margin-bottom: calc(var(--padding) * 2);
}
.u-cron-field .u-radio--wrap {
  width: 100%;
}
.u-cron-field select {
  margin-left: 0.5em;
  margin-right: 0.5em;
}
.u-cron__desc-part {
  margin-right: .5em;
  cursor: pointer;
}
</style>
