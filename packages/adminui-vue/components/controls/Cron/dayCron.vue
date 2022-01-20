<template>
  <SecondsCron
    v-bind="$attrs"
    mode="day"
    :length="31"
    v-on="$listeners"
  />
</template>

<script>
export default {
  name: 'DayCron',
  components: {
    SecondsCron: require('./secondsCron.vue').default
  }
}
</script>

<style lang="scss" scoped></style>
