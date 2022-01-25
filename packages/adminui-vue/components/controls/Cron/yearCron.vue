<template>
  <SecondsCron
    v-bind="$attrs"
    mode="year"
    :length="50"
    :start-count="Number(new Date().getFullYear())"
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
