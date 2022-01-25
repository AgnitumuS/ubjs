<template>
  <SecondsCron
    v-bind="$attrs"
    mode="minute"
    v-on="$listeners"
  />
</template>

<script>
export default {
  name: 'MinutesCron',
  components: {
    SecondsCron: require('./secondsCron.vue').default
  }
}
</script>
