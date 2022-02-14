<template>
  <seconds-cron
    v-bind="$attrs"
    mode="hour"
    :length="22"
    :start-count="1"
    v-on="$listeners"
  />
</template>

<script>
export default {
  name: 'HoursCron',
  components: {
    SecondsCron: require('./secondsCron.vue').default
  }
}
</script>

<style lang="scss" scoped></style>
