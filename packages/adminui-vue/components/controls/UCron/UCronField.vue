<template>
  <section class="u-cron-field">
    <u-radio
      v-model="kind"
      :items="kinds"
      @change="emitChange"
    >
      <template #specify>
        <u-cron-specific
          :items="namedRange"
          @change="doOnSpecifyChanged"
        />
      </template>

      <template #between>
        <div>
          <span>
            {{ betweenLabel }}
            <select
              v-model="betweenStart"
              @change="emitChange"
            >
              <option
                v-for="i in range"
                :key="i+1"
                :value="i"
                :disabled="!!betweenEnd && i >= betweenEnd[1]"
              >
                {{ getItemName(i) }}
              </option>
            </select>
          </span>
          <span>
            {{ `${$ut('UCron.and')}` }}
            <select
              v-model="betweenEnd"
              :disabled="!betweenStart"
              @change="emitChange"
            >
              <option
                v-for="i in range"
                :key="i * 999999"
                :value="i"
                :disabled="i <= betweenStart"
              >
                {{ getItemName(i) }}
              </option>
            </select>
            {{ `${$ut(`UCron.${mode}`)}` }}
          </span>
        </div>
      </template>
    </u-radio>

    <u-checkbox
      v-model="doRepeatEvery"
      label="UCron.step"
      @change="emitChange"
    >
      <select
        v-model="repeatEveryVal"
        @change="emitChange"
      >
        <option
          v-for="i in range"
          :key="i+1"
          :value="i"
        >
          {{ i }}
        </option>
      </select>
    </u-checkbox>
  </section>
</template>

<script>
export default {
  name: 'UCronField',
  components: {
    UCronSpecific: require('./UCronSpecific.vue').default
  },
  props: {
    value: {
      type: String,
      default: ''
    },
    mode: {
      type: String,
      default: 'second'
    },
    rangeStart: {
      type: Number,
      default: 0
    },
    rangeEnd: {
      type: Number,
      default: 59
    },
    getItemName: {
      type: Function,
      default: (n) => n.toString()
    }
  },
  data () {
    return {
      kind: 'every',
      namedRange: [],
      checkedSpecifyIds: [],
      betweenStart: null,
      betweenEnd: null,
      doRepeatEvery: false,
      repeatEveryVal: '0'
    }
  },
  watch: {
    value (newVal) {
      this.setFieldValue(newVal)
    }
  },
  created () {
    this.namedRange = this.range.map(n => {
      return {
        id: n.toString(),
        label: this.getItemName(n),
        checked: false
      }
    })
    this.setFieldValue(this.value)
  },
  computed: {
    range: function () {
      const res = []
      for (let i = this.rangeStart; i <= this.rangeEnd; i++) {
        res.push(i)
      }
      return res
    },
    kinds () {
      return [
        { id: 'every', label: `${this.$ut('UCron.every')} ${this.$ut(`UCron.${this.mode}`)}` },
        { id: 'specify', label: `${this.$ut('UCron.specific')} ${this.$ut(`UCron.${this.mode}`)} (${this.$ut('UCron.chooseOneOrMany')})` },
        { id: 'between', label: '' }
      ]
    },
    betweenLabel () {
      return `${this.$ut('UCron.every')} ${this.$ut(`UCron.${this.mode}`)} ${this.$ut('UCron.between')}`
    }
  },
  methods: {
    doOnSpecifyChanged (checkedIds) {
      this.checkedSpecifyIds = checkedIds
      this.emitChange()
    },
    emitChange () {
      const v = this.getFieldValue()
      this.$emit('change', v)
    },
    getFieldValue () {
      const kind = this.kind
      let val = '*'
      if (kind === 'every') {
        val = '*'
      } else if (kind === 'specify' && this.checkedSpecifyIds.length > 0) {
        val = this.checkedSpecifyIds.join()
      } else if (kind === 'between' && this.betweenStart !== null && this.betweenEnd !== null) {
        val = this.betweenStart + '-' + this.betweenEnd
      }

      if (this.doRepeatEvery && +this.repeatEveryVal > 1) {
        val += '/' + this.repeatEveryVal
      }
      return val
    },
    setFieldValue (newVal) {
      let value = newVal || '*'
      if (value.includes('/')) {
        const arr = value.split('/')
        value = arr[0] || '*'
        this.repeatEveryVal = arr[1] || '1'
      }

      if (value === '*') {
        this.kind = 'every'
      } else if (value.includes('-')) {
        this.kind = 'between'
        const arr = value.split('-')
        this.betweenStart = arr[0]
        this.betweenEnd = arr[1]
      } else {
        this.kind = 'specify'
        const arr = value.split(',').map(v => v.trim()) // '1' -> ['1'], '1, 2' -> ['1', '2']
        this.setCheckedSpecifyItems(arr)
      }
    },
    setCheckedSpecifyItems (arr) {
      this.namedRange.forEach(el => {
        el.checked = arr.includes(el.id)
      })
    }
  }
}
</script>
