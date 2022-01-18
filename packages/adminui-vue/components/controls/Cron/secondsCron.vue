<template>
  <div>
    <u-radio
      v-model="value"
      :items="items"
      name="SecondsCron"
    >
      <template #start>
        <div class="cron__start">
          <span class="cron__start__item">
            Every
            <select>
              <option
                v-for="sec in SECONDS"
                :key="sec"
                :value="sec"
              >
                {{ sec }}
              </option>
            </select>
            second(s)
          </span>
          <span class="cron__start__item">
            starting at second
            <select>
              <option
                v-for="sec in SECONDS"
                :key="sec * 999"
                :value="sec"
              >
                {{ sec }}
              </option>
            </select>
          </span>
        </div>
      </template>

      <template #specify>
        <SpecifyCron
          :items="specifyItems"
          @change="changeHandler"
        />
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
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      SECONDS,
      items: [
        { id: 'every', label: 'Кожної секунди' },
        { id: 'start', label: '' },
        { id: 'specify', label: 'Specific second (choose one or many)' },
        { id: 'between', label: 'Specific second (choose one or many)' }
      ],
      value: 'specify',
      specifyItems: [],
      checkedSpecifyItems: []
    }
  },
  watch: {
    value (e) {
      console.log(e)
    }
  },
  created () {
    this.specifyItemsCreate()
  },
  methods: {
    specifyItemsCreate () {
      for (let i = 0; i <= SECONDS; i++) {
        const element = {
          label: i.toString(),
          value: false
        }
        this.specifyItems.push(element)
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
      console.log(this.value)
    }
  }
}
</script>

<style lang="scss" scoped></style>
