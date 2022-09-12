<template>
  <section
    class="specify-cron"
  >
    <u-checkbox
      v-for="(item, index) in items"
      :key="index+1"
      v-model="item.checked"
      :label="item.label"
      @change="doOnChange"
    />
    <slot />
  </section>
</template>

<script>
export default {
  name: 'UCronSpecific',

  props: {
    items: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    doOnChange () {
      const checkedIds = []
      for (let i = 0, L = this.items.length; i < L; i++) {
        if (this.items[i].checked) checkedIds.push(this.items[i].id)
      }
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
  min-width: 4em;
}

</style>
