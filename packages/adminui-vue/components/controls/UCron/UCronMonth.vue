<template>
  <u-cron-field
    v-bind="$attrs"
    mode="month"
    :range-start="1"
    :range-end="12"
    :get-item-name="getMonthName"
    v-on="$listeners"
  />
</template>

<script>
export default {
  name: 'UCronMonth',
  components: {
    UCronField: require('./UCronField.vue').default
  },
  methods: {
    getMonthName (m) {
      const date = new Date(2022, m - 1, 1)
      const lang = this.$UB.connection.userLang()
      return date.toLocaleString(lang, { month: 'long' })
    }
  }
}
</script>
