<template>
  <form
    class="specify-cron"
    name="qw"
  >
    <u-checkbox
      v-for="(item, index) in items"
      :key="index"
      v-model="item.value"
      :label="item.label"
      @change="changeHandler($event, index)"
    />
  </form>
</template>

<script>
export default {
  name: 'SpecifyCron',

  props: {
    items: {
      type: Array,
      default: () => []
    },
    defaultChecked: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      values: []
    }
  },
  methods: {
    changeHandler (value, index) {
      this.$set(this.values, index, value)
      const checkedIndexes = this.items
        .map((el, index) => {
          return el.value ? index : el.value
        })
        .filter((el) => !!el || el === 0)
      this.$emit('change', checkedIndexes)
    }
  }
}
</script>

<style>
.specify-cron {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  max-width: 100%;
  padding-left: 26px;
}
.specify-cron .u-checkbox {
  width: 40px;
}
</style>
