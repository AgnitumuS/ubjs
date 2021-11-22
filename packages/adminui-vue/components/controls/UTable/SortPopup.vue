<template>
  <u-button-group :direction="direction">
    <u-button
      v-for="sortOption in sortOptions"
      :key="sortOption.value"
      :icon="sortOption.icon"
      :color="sortOption.value === sortOrder ? 'primary' : 'control'"
      :appearance="sortOption.value === sortOrder ? 'default' : 'plain'"
      @click="$emit('select-sort', sortOption.value)"
    >
      {{ sortOption.label }}
    </u-button>
  </u-button-group>
</template>

<script>
export default {
  name: 'SortPopup',
  props: {
    direction: {
      type: String,
      default: 'horizontal',
      validator (value) {
        return ['horizontal', 'vertical'].includes(value)
      }
    },
    sortOrder: {
      type: String,
      default: 'none'
    }
  },
  data () {
    return {
      sortOptions: [
        {
          label: this.$ut('table.sort.direction.asc'),
          value: 'asc',
          icon: 'u-icon-sort-asc-alt'
        },
        {
          label: this.$ut('table.sort.direction.desc'),
          value: 'desc',
          icon: 'u-icon-sort-desc-alt'
        },
        {
          label: this.$ut('table.sort.direction.none'),
          icon: 'u-icon-circle-close',
          value: 'none'
        }
      ]
    }
  }
}
</script>
