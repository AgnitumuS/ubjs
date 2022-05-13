<template>
  <div>
    <u-radio
      v-model="value"
      :items="items"
      :name="mode"
    >
      <template #start>
        <div class="cron__start">
          <span class="cron__start__item">
            Every
            <select v-model="startEvery[0]">
              <option
                v-for="indexDay in 7"
                :key="indexDay"
                :value="indexDay"
              >
                {{ indexDay }}
              </option>
            </select>
            day of week
          </span>
          <span class="cron__start__item">
            starting on
            <select v-model="startEvery[1]">
              <option
                v-for="day in daysOfWeek"
                :key="day.id * 99"
                :value="day.id"
              >
                {{ day.longName }}
              </option>
            </select>
          </span>
        </div>
      </template>

      <template #specify>
        <SpecifyCron
          :items="displaySpecifyItems"
          @change="changeHandler"
        />
      </template>

      <template #between>
        <div class="cron__start">
          <span class="cron__start__item">
            {{
              `${$ut('UCron.every')} ${$ut('UCron.day')} ${$ut(
                'UCron.between'
              )}`
            }}
            <select v-model="betweenSeconds[0]">
              <option
                v-for="day in daysOfWeek"
                :key="day.id"
                :value="day.id"
              >
                {{ day.longName }}
              </option>
            </select>
          </span>
          <span class="cron__start__item">
            {{ `${$ut('UCron.and')}` }}
            <select
              v-model="betweenSeconds[1]"
              :disabled="!betweenSeconds[0] && betweenSeconds[0] !== 0"
            >
              <option
                v-for="day in daysOfWeek"
                :key="day.id * 999999"
                :value="day.id"
              >
                {{ day.longName }}
              </option>
            </select>
          </span>
        </div>
      </template>
    </u-radio>
  </div>
</template>

<script>
export default {
  name: 'WeekCron',
  components: {
    SpecifyCron: require('./SpecifyCron.vue').default
  },
  props: {
    item: {
      type: Object,
      default: () => ({})
    },
    mode: {
      type: String,
      default: 'second'
    },
    length: {
      type: Number,
      default: 0
    },
    startCount: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      daysOfWeek: [],
      currLength: this.length,
      items: [
        { id: 'specify', label: this.getSpecificLabel() },
        { id: 'between', label: '' }
      ],
      value: 'specify',
      displaySpecifyItems: [],
      checkedSpecifyIds: [],
      betweenSeconds: ['', ''],
      startEvery: ['', '']
    }
  },
  watch: {
    value () {
      this.emitChange()
    },
    betweenSeconds (e) {
      if (e.length === 2) this.emitChange()
    },
    startEvery (e) {
      if (e.length === 2) this.emitChange()
    }
  },
  created () {
    this.createDaysOfWeek()
    this.specifyItemsCreate()
    this.restoreCron()
  },
  methods: {
    getSpecificLabel () {
      const { $ut } = this
      const str = `${$ut('UCron.specific')} ${$ut(
        'UCron.dayOfWeek'
      )} (${$ut('UCron.chooseOneOrMany')})`
      return str
    },
    createDaysOfWeek () {
      const d = new Date(2022, 0, 2) // 2022-01-02 known to be sunday
      const lang = this.$UB.connection.userLang()
      for (let i = 0; i < 7; i++) {
        const element = {
          shortName: d.toLocaleString(lang, { weekday: 'short' }),
          longName: d.toLocaleString(lang, { weekday: 'long' }),
          id: i
        }
        this.daysOfWeek.push(element)
        d.setDate(d.getDate() + 1)
      }
    },
    specifyItemsCreate () {
      this.daysOfWeek.forEach((day) => {
        const element = {
          label: day.shortName,
          checked: false,
          id: day.id
        }
        this.displaySpecifyItems.push(element)
      })
    },
    changeHandler (checkedIds) {
      this.checkedSpecifyIds = checkedIds
      this.emitChange()
    },
    emitChange () {
      const v = this.getValue()
      this.$emit('change', v)
    },
    getValue () {
      const { value } = this
      if (value === 'specify' && this.checkedSpecifyIds.length > 0) {
        return this.checkedSpecifyIds.join()
      }
      if (
        value === 'between' &&
        this.betweenSeconds.length === 2 &&
        this.betweenSeconds.every((i) => !!i || i === 0)
      ) {
        return this.betweenSeconds.join('-')
      }
      return '*'
    },
    restoreCron () {
      const value = this.item.value
      if (value.includes('-')) {
        this.value = 'between'
        const arr = value.split('-')
        this.betweenSeconds = arr
      }
      if (value.includes(',')) {
        this.value = 'specify'
        const arr = value.split(',')
        this.setCheckedSpecifyItems(arr)
      }
      if (!Number.isNaN(Number(value))) {
        this.setCheckedSpecifyItems([value])
      }
    },
    setCheckedSpecifyItems (arr) {
      arr.forEach((value) => {
        const el = this.displaySpecifyItems.find(
          (el) => el.id === +value.trim()
        )
        if (el) el.checked = true
      })
    }
  }
}
</script>
