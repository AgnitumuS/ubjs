<template>
  <SecondsCron
    v-bind="$attrs"
    mode="month"
    :length="11"
    v-on="$listeners"
  />
</template>

<script>
export default {
  name: 'MonthCron',
  components: {
    SecondsCron: require('./secondsCron.vue').default
  }
}
</script>

<style lang="scss" scoped></style>
