<template>
  <seconds-cron
    v-bind="$attrs"
    mode="month"
    :length="11"
    :start-count="1"
    :custom-spesify-items="specifyItemsCreate"
    v-on="$listeners"
  />
</template>

<script>
export default {
  name: 'MonthCron',
  components: {
    SecondsCron: require('./secondsCron.vue').default
  },
  methods: {
    specifyItemsCreate () {
      const result = []
      const date = new Date(2022, 0, 1)
      const lang = this.$UB.connection.userLang()
      for (let i = 1; i <= 12; i++) {
        date.setMonth(i - 1)
        const element = {
          label: date.toLocaleString(lang, { month: 'long' }),
          checked: false,
          id: '' + i
        }
        result.push(element)
      }
      return result
    }
  }
}
</script>
