<template>
  <u-cron-field
    v-bind="$attrs"
    mode="dayOfWeek"
    :range-start="0"
    :range-end="6"
    :get-item-name="getWeekDayName"
    v-on="$listeners"
  />
</template>

<script>
export default {
  name: 'UCronDayOfWeek',
  components: {
    UCronField: require('./UCronField.vue').default
  },
  methods: {
    getWeekDayName (d) {
      const dt = new Date(2022, 0, 2 + d) // 2022-01-02 known to be sunday
      const lang = this.$UB.connection.userLang()
      return dt.toLocaleString(lang, { weekday: 'short' })
    },
  }
}
</script>
