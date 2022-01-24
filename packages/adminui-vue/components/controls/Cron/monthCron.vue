<template>
  <SecondsCron
    v-bind="$attrs"
    mode="month"
    :length="11"
    :start-count="1"
    v-on="$listeners"
    :custom-spesify-items="specifyItemsCreate"
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
      default: $App.connection.userData('lang')
    }
  },
  methods: {
    specifyItemsCreate() {
      const result = []
      const date = new Date()
      const { locale } = this
      for (let i = 0; i <= 11; i++) {
        date.setMonth(i)
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
