<template>
  <div>
    <label for=""
      >Кожного:
      <input type="number" min="1" max="31" v-model="data.day" step="1" /> дня о
    </label>
    <input type="time" v-model="curTime" />
  </div>
</template>

<script>
export default {
  name: "DayCron",
  props: {
    time: {
      type: String,
    },
    day: {
      type: String,
    },
    data: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
        dayValue: this.day,
    //   curTime: this.time,
    };
  },
  computed: {
    curTime: {
      get() {
        return this.data.minute + ":" + this.data.hour;
      },
      set(e) {
        const z = e.split(":");
        this.data.minute = z[0];
        this.data.hour = z[1];
      },
    },
  },
  watch: {
    dayValue(e) {
      console.log(e);
      this.$emit("input", e);
    },
    curTime(e) {
      this.$emit("input", e);
    },
  },
};
</script>

<style lang="scss" scoped>
</style>