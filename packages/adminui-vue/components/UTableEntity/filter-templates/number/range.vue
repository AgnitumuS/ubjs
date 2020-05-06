<template>
  <form
    class="filter-section"
    @submit.prevent="$emit('search', {
      whereList,
      description: `${$ut('table.filter.date.from')} ${valueFrom} ${$ut('table.filter.date.to')} ${valueTo} `
    })"
  >
    <u-base-input
      v-model="valueFrom"
      :placeholder="$ut('table.filter.date.from')"
      class="filter-input-number"
      type="number"
    />
    -
    <u-base-input
      v-model="valueTo"
      :placeholder="$ut('table.filter.date.to')"
      class="filter-input-number"
      type="number"
    />

    <u-button
      appearance="inverse"
      :disabled="isEmpty"
      type="submit"
      icon="u-icon-search"
      size="large"
    />
  </form>
</template>

<script>
export default {
  name: 'FilterNumberRange',

  data () {
    return {
      valueFrom: 0,
      valueTo: 0
    }
  },

  computed: {
    isEmpty () {
      return this.testEmpty(this.valueFrom) && this.testEmpty(this.valueTo)
    },

    whereList () {
      const whereList = []
      if (this.valueFrom) {
        whereList.push({ condition: 'moreEqual', value: this.valueFrom })
      }

      if (this.valueTo) {
        whereList.push({ condition: 'lessEqual', value: this.valueTo })
      }

      return whereList
    }
  },

  methods: {
    testEmpty (value) {
      return value === null || value === ''
    }
  }
}
</script>
