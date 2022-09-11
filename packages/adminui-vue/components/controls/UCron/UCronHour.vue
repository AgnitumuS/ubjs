<template>
  <u-cron-field
    v-bind="$attrs"
    mode="hour"
    :range-start="0"
    :range-end="23"
    v-on="$listeners"
  />
</template>

<script>
export default {
  name: 'UCronHour',
  components: {
    UCronField: require('./UCronField.vue').default
  }
}
</script>

<style lang="scss" scoped></style>
