<template>
  <div>
    Cron
    <UCheckbox v-model="value" />
  </div>
</template>

<script>
export default {
  name: "Cron",
  data() {
    return {
      value: true,
    };
  },
  watch: {
    value(e) {
      console.log(e);
    },
  },
};
</script>

<style lang="scss" scoped>
</style>