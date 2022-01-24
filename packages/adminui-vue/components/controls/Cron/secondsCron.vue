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
                v-for="sec in currLength"
                :key="sec"
                :value="sec"
              >
                {{ sec }}
              </option>
            </select>
            {{ `${mode}(s)` }}
          </span>
          <!-- <span class="cron__start__item">
            {{ `starting at ${mode}` }}
            <select v-model="startEvery[1]">
              <option
                v-for="(sec, index) in currLength"
                :key="sec * 999"
                :value="index + startCount"
              >
                {{ index + startCount }}
              </option>
            </select>
          </span> -->
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
            {{ `Every ${mode} between ${mode}` }}
            <select v-model="betweenSeconds[0]">
              <option
                v-for="(sec, index) in currLength"
                :key="sec"
                :value="index + startCount"
                :disabled="
                  !!betweenSeconds[1] && index + startCount >= betweenSeconds[1]
                "
              >
                {{ index + startCount }}
              </option>
            </select>
          </span>
          <span class="cron__start__item">
            {{ `and ${mode}` }}
            <select
              v-model="betweenSeconds[1]"
              :disabled="!betweenSeconds[0]"
            >
              <option
                v-for="(sec, index) in currLength"
                :key="sec * 999999"
                :value="index + startCount"
                :disabled="index + startCount <= betweenSeconds[0]"
              >
                {{ index + startCount }}
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
    },
    locale: {
      type: String,
      default: $App.connection.userData('lang')
    },
    customSpesifyItems: null,
  },
  data () {
    return {
      currLength: this.length,
      items: [
        { id: 'every', label: 'Every {{mode}}' },
        { id: 'start', label: '' },
        { id: 'specify', label: 'Specific {{mode}} (choose one or many)' },
        { id: 'between', label: '' }
      ],
      value: 'specify',
      displaySpecifyItems: [],
      checkedSpecifyIds: [],
      betweenSeconds: ['', ''],
      startEvery: ['', 0]
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
    if (this.length === 0) this.currLength = 59 // seconds
    this.displaySpecifyItems = this.specifyItemsCreate()
    this.items.forEach((i) => {
      i.label = i.label.replace('{{mode}}', this.mode)
    })
    this.restoreCron()
  },
  methods: {
    specifyItemsCreate () {
      const result = []
      if (this.customSpesifyItems && typeof this.customSpesifyItems === 'function') return this.customSpesifyItems()
      for (let i = 0; i <= this.currLength; i++) {
        const element = {
          label: (i + this.startCount).toString(),
          checked: false,
          id: (i + this.startCount).toString()
        }
        result.push(element)
      }
      return result
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
      if (value === 'every') {
        return '*'
      }
      if (value === 'specify' && this.checkedSpecifyIds.length > 0) {
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
      if (!value || value === '*') {
        this.value = 'every'
        return
      }
      if (value.includes(',')) {
        this.value = 'specify'
        const arr = value.split(',')
        this.setCheckedSpecifyItems(arr)
        return
      }
      if (value.includes('/')) {
        this.value = 'start'
        const arr = value.split('/')
        if (arr[0] === '*') arr[0] = '0'
        this.startEvery = arr.reverse()
      }
      if (value.includes('-')) {
        this.value = 'between'
        const arr = value.split('-')
        this.betweenSeconds = arr
      }
      if (!Number.isNaN(Number(value))) {
        this.setCheckedSpecifyItems([value])
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
