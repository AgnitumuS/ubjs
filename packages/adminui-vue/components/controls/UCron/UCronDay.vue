<template>
  <u-cron-field
    v-bind="$attrs"
    mode="day"
    :range-start="1"
    :range-end="30"
    v-on="$listeners"
  />
</template>

<script>
export default {
  name: 'UCronDay',
  components: {
    UCronField: require('./UCronField.vue').default
  }
}
</script>
