<template>
  <div class="year-cron">
    <label
      for=""
    >Кожного
      <input
        v-model="data.year"
        type="number"
        min="1"
        max="99999"
        step="1"
      >
      року
    </label>
  </div>
</template>

<script>
export default {
  name: 'YearCron',
  components: {
    monthCron: require('./monthCron.vue').default
  },
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  }
}
</script>

<style>
.year-cron {
  display: flex;
}
</style>
