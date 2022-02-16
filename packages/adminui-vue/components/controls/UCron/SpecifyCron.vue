<template>
  <form
    class="specify-cron"
    name="specify-cron"
  >
    <u-checkbox
      v-for="(item, index) in items"
      :key="index"
      v-model="item.checked"
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
    }
  },
  methods: {
    changeHandler (value, index) {
      const checkedIds = this.items
        .map((el, index) => {
          return el.checked ? el.id : el.checked
        })
        .filter((el) => !!el || el === 0)
      this.$emit('change', checkedIds)
    }
  }
}
</script>

<style>
.specify-cron {
  display: flex;
  flex-wrap: wrap;
  gap: var(--u-gap-double);
  max-width: 100%;
  padding-left: calc(var(--padding) * 3);
}
.specify-cron .u-checkbox {
  min-width: 40px;
  margin-right: var(--u-gap-double);
}
.specify-cron .u-checkbox__label {
  text-transform: capitalize;
}
</style>
