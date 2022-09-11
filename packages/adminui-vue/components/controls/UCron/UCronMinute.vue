<template>
  <u-cron-field
    v-bind="$attrs"
    mode="minute"
    :range-start="0"
    :range-end="59"
    v-on="$listeners"
  />
</template>

<script>
export default {
  name: 'UCronMinute',
  components: {
    UCronField: require('./UCronField.vue').default
  }
}
</script>
