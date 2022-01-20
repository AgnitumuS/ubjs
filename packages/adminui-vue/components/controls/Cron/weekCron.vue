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
            {{ `Every day between` }}
            <select v-model="betweenSeconds[0]">
              <option
                v-for="day in daysOfWeek"
                :key="day.id"
                :value="day.id"
                :disabled="
                  (!!betweenSeconds[1] || betweenSeconds[1] === 0) &&
                    day.id >= betweenSeconds[1]
                "
              >
                {{ day.longName }}
              </option>
            </select>
          </span>
          <span class="cron__start__item">
            {{ `and` }}
            <select
              v-model="betweenSeconds[1]"
              :disabled="!betweenSeconds[0] && betweenSeconds[0] !== 0"
            >
              <option
                v-for="day in daysOfWeek"
                :key="day.id * 999999"
                :value="day.id"
                :disabled="day.id <= betweenSeconds[0]"
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
  name: 'SecondsCron',
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
        // { id: 'start', label: '' },
        { id: 'specify', label: 'Specific day of week (choose one or many)' },
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
    createDaysOfWeek () {
      const date = new Date()
      const intlShort = new Intl.DateTimeFormat('en-US', { weekday: 'short' })
      const intlLong = new Intl.DateTimeFormat('en-US', { weekday: 'long' })

      for (let i = 0; i < 7; i++) {
        const element = {
          shortName: intlShort.format(date),
          longName: intlLong.format(date),
          id: date.getDay()
        }
        this.daysOfWeek.push(element)
        date.setDate(date.getDay() + 1)
      }
      this.daysOfWeek.sort((a, b) => {
        return a.id - b.id
      })
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
      if (value === 'specify') {
        return this.checkedSpecifyIds.join()
      }
      if (
        value === 'start' &&
        this.startEvery.length === 2 &&
        this.startEvery.every((i) => !!i || i === 0)
      ) {
        const arr = this.startEvery.map((i) => i)
        if (arr[1] === 0) arr[1] = '*'
        return arr.reverse().join('/')
      }
      if (
        value === 'between' &&
        this.betweenSeconds.length === 2 &&
        this.betweenSeconds.every((i) => !!i)
      ) {
        return this.betweenSeconds.join('-')
      }
      return '*'
    },
    restoreCron () {
      const value = this.item.value
      if (value.includes('/')) {
        this.value = 'start'
        const arr = value.split('/')
        if (arr[0] === '*') arr[0] = '0'
        this.startEvery = arr.reverse()
      }
    },
    setCheckedSpecifyItems (arr) {
      arr.forEach((value) => {
        const el = this.displaySpecifyItems.find((el) => el.id === value.trim())
        if (el) el.checked = true
      })
    }
  }
}
</script>

<style lang="scss" scoped></style>
