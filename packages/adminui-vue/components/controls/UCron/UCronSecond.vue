<template>
  <u-cron-field
    :value="value"
    mode="second"
    :range-start="0"
    :range-end="59"
    @change="$emit('change', $event)"
  />
</template>

<script>
export default {
  name: 'UCronSecond',
  components: {
    UCronField: require('./UCronField.vue').default
  },
  props: ['value'],
// {
//     value: {
//       type: String,
//       default: '0'
//     }
//   },
  methods: {
    onChange (e) {
      this.$emit('change', e)
    }
  }
}
</script>
