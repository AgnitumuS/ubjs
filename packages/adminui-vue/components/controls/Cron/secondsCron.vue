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
            <select>
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
          <span class="cron__start__item">
            {{ `starting at ${mode}` }}
            <select>
              <option
                v-for="(sec, index) in currLength"
                :key="sec * 999"
                :value="index"
              >
                {{ index }}
              </option>
            </select>
          </span>
        </div>
      </template>

      <template #specify>
        <SpecifyCron
          :items="displaySpecifyItems"
          :default-checked="checkedSpecifyItems"
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
                :value="index"
              >
                {{ index }}
              </option>
            </select>
          </span>
          <span class="cron__start__item">
            {{ `and ${mode}` }}
            <select v-model="betweenSeconds[1]">
              <option
                v-for="(sec, index) in currLength"
                :key="sec * 999"
                :value="index"
                :disabled="index <= betweenSeconds[0]"
              >
                {{ index }}
              </option>
            </select>
          </span>
        </div>
      </template>
    </u-radio>
  </div>
</template>

<script>
const { SECONDS } = require('./variablesCron.js')
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
    }
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
      checkedSpecifyItems: [],
      betweenSeconds: []
    }
  },
  watch: {
    value () {
      this.emitChange()
    },
    betweenSeconds (e) {
      if (e.length === 2) this.emitChange()
    }
  },
  created () {
    if (this.length === 0) this.currLength = SECONDS
    this.specifyItemsCreate()
    this.items.forEach((i) => {
      i.label = i.label.replace('{{mode}}', this.mode)
    })
    this.restoreCron()
  },
  methods: {
    specifyItemsCreate () {
      for (let i = 0; i <= this.currLength; i++) {
        const element = {
          label: i.toString(),
          value: false
        }
        this.displaySpecifyItems.push(element)
      }
    },
    changeHandler (checkedIndexes) {
      this.checkedSpecifyItems = checkedIndexes
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
      if (value === 'specify') {
        return this.checkedSpecifyItems.join()
      }
      if (value === 'between') {
        return this.betweenSeconds.join('-')
      }
      return '*'
    },
    restoreCron () {
      const value = this.item.value
      console.log(value)
      if (!value || value === '*') {
        this.value = 'every'
        return
      }
      if (value.includes(',')) {
        this.value = 'specify'
        const arr = value.split(',')
        arr.forEach((index) => {
          this.displaySpecifyItems[+index].value = true
        })
        return
      }
      if (value.includes('-')) {
        this.value = 'between'
        const arr = value.split('-')
        this.betweenSeconds = arr
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>
