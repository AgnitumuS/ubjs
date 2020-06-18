<template>
  <div
    v-if="availableFilters.length > 0"
    class="filter-section"
  >
    <el-select
      v-model="selectedFilter"
      class="filter-input"
      :placeholder="$ut('table.filter.conditionPlaceholder')"
    >
      <el-option
        v-for="filterKey in availableFilters"
        :key="filterKey"
        :value="filterKey"
        :label="$ut(selectedColumn.filters[filterKey].label || filterKey)"
      />
    </el-select>

    <keep-alive>
      <component
        :is="selectedColumn.filters[selectedFilter].template"
        v-if="selectedColumn.filters[selectedFilter]"
        :key="condition"
        :column="selectedColumn"
        @search="throttledApplyFilter"
      />
    </keep-alive>
  </div>
</template>

<script>
const { mapGetters, mapActions } = require('vuex')
const { throttle } = require('throttle-debounce')

export default {
  data () {
    return {
      condition: null
    }
  },

  computed: {
    ...mapGetters(['selectedColumn']),

    availableFilters () {
      return Object.keys(this.selectedColumn.filters)
        .filter(key => this.selectedColumn.filters[key].template)
    },

    selectedFilter: {
      get () {
        if (this.condition) {
          return this.condition
        }

        if (this.availableFilters.length > 0) {
          return this.availableFilters[0]
        } else {
          return {}
        }
      },
      set (value) {
        this.condition = value
      }
    }
  },

  methods: {
    ...mapActions(['applyFilter']),

    throttledApplyFilter: throttle(50, function (...args) {
      this.applyFilter(...args)
    })
  }
}
</script>

<style>
.filter-container {
  display: flex;
  background: hsl(var(--hs-background), var(--l-background-default));
  border-radius: var(--border-radius);
  padding: 4px 8px;
  margin: 4px 0;
  margin-left: 8px;
  align-items: center;
}

.filter-input{
  margin: 0 4px;
  flex-grow: 1;
  max-width: 170px;
  min-width: 100px;
}

.filter-input-number{
  margin: 0 4px;
  width: 120px;
}

.filter-section{
  display: flex;
  align-items: center;
  flex-grow: 1;
}

.filter-input_value{
  margin: 0 4px;
  flex-grow: 1;
  min-width: 100px;
}
</style>
