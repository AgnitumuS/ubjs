<template>
  <SecondsCron
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
  props: {
    locale: {
      type: String,
      default: window.$App.connection.userData('lang')
    }
  },
  methods: {
    specifyItemsCreate () {
      const result = []
      const date = new Date()
      const { locale } = this
      for (let i = 1; i <= 12; i++) {
        date.setMonth(i - 1)
        const element = {
          label: date.toLocaleString(locale, { month: 'long' }),
          checked: false,
          id: i.toString()
        }
        result.push(element)
      }
      return result
    }
  }
}
</script>

<style lang="scss" scoped></style>
