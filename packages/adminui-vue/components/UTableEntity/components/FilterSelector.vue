<template>
  <u-dropdown
    v-if="filterColumns.length > 0"
    ref="dropdown"
    custom-class="filter-selector"
    @open="openDropdownHandler"
  >
    <u-button
      :title="$ut('table.filter.list.title')"
      appearance="inverse"
      color="control"
      icon="u-icon-filter"
    />

    <div
      slot="dropdown"
      class="filter-selector__main"
    >
      <div class="filter-selector__header">
        <u-button
          class="filter-selector__header__btn"
          type="submit"
          icon="u-icon-search"
          color="primary"
          size="small"
          :disabled="disabledSearchBtn"
          @click.native="searchHandler"
        >
          {{ $ut('search') }}
        </u-button>
        <u-button
          class="filter-selector__header__btn"
          type="submit"
          icon="u-icon-add"
          color="success"
          size="small"
          appearance="plain"
          :disabled="disabledSearchBtn"
          @click="counterHandler"
        >
          {{ $ut('add') }}
        </u-button>
        <div class="filter-selector__count">
          <span>{{ length }}</span>
        </div>
      </div>
      <div class="filter-selector__body">
        <template v-for="(item, index) in length">
          <filter-item
            :key="selectedColumns[index] && selectedColumns[index].id ? selectedColumns[index].id : index"
            ref="filterItem"
            :columns="filterColumns"
            :search-disabled="
              ($event) => {
                searchDisabledHandler($event, index)
              }
            "
            :can-remove="length > 1"
            :selected-column="selectedColumns[index]"
            @selected-column="selectedColumnHandler($event, index)"
            @remove-filter="removeFilterHandler(index)"
          />
          <div
            :key="(item + 1) * 10"
            class="filter-selector__delimiter"
          >
            <span>{{ $ut('and') }}</span>
          </div>
        </template>
      </div>
    </div>
  </u-dropdown>
</template>

<script>
const { mapGetters } = require('vuex')

export default {
  components: {
    FilterItem: require('./FilterItem.vue').default
  },
  data () {
    return {
      length: 1,
      currentColumn: [],
      selectedColumns: [],
      disabledSearchBtn: true
    }
  },

  computed: {
    ...mapGetters(['columns']),
    availableColumns () {
      const result = this.columns.filter((column) => {
        const availableFilters = Object.keys(column.filters)
        const hasFilters = availableFilters.length > 0
        const everyFilterHasTemplate = availableFilters.every(
          (filterCode) => column.filters[filterCode].template
        )

        return hasFilters && everyFilterHasTemplate
      })
      return result
    },
    filterColumns () {
      return this.availableColumns.filter((item) => {
        const index = this.selectedColumns.findIndex((el) => el.id === item.id)
        return index === -1
      })
    }
  },
  methods: {
    openDropdownHandler () {
      this.restoreFilters()
      this.setDisabledSearchBtn()
    },
    restoreFilters () {
      const { filters } = this.$store.state
      this.selectedColumns.splice(0)
      this.length = 1
      if (!filters || !filters.length) return
      const { availableColumns } = this
      filters.forEach((item) => {
        if (!item.whereList) return
        const firstList = item.whereList[0]
        const column = availableColumns.find(
          (i) => i.id === firstList.expression
        )
        if (!column) return
        column.condition = firstList.condition
        column.value = firstList.value
        if (firstList.condition === 'equal' && typeof column.value === 'boolean') {
          column.condition = column.value ? 'isTrue' : 'isFalse'
        }
        this.selectedColumns.push(column)
        const secondtList = item.whereList[1]
        if (!secondtList) return
        column.condition = 'range'
        column.value = [firstList.value, secondtList.value]
      })
      this.length = this.selectedColumns.length
    },
    setDisabledSearchBtn () {
      let flag = true
      if (this.selectedColumns.length < this.length) {
        flag = true
      } else {
        flag = this.selectedColumns.some((i) => {
          if (!Object.keys(i).length) return true
          return i.searchDisabled
        })
      }
      this.disabledSearchBtn = flag
    },
    searchDisabledHandler (value, index) {
      const target = this.selectedColumns[index]
      if (!target) return
      target.searchDisabled = !!value
      this.setDisabledSearchBtn()
    },
    selectedColumnHandler (columnId, index) {
      const column =
        this.availableColumns.find((item) => item.id === columnId) || {}
      column.disabled = false
      this.selectedColumns.splice(index, 1, column)
      this.setDisabledSearchBtn()
    },
    counterHandler () {
      if (this.length === this.availableColumns.length) return
      ++this.length
      this.setDisabledSearchBtn()
    },
    async searchHandler () {
      const { selectedColumns, $store } = this
      this.$store.commit('CLEAR_FILTER')
      this.$refs.filterItem.forEach((comp, index) => {
        const el = comp.$refs.searchComponent
        const condition = el.getCondition()
        const column = selectedColumns[index]
        $store.commit('APPLY_FILTER', {
          columnId: column.id,
          label: column.label,
          description: condition.description,
          whereList: condition.whereList.map((whereItem) => ({
            ...whereItem,
            expression: whereItem.expression || column.id
          }))
        })
      })
      this.$refs.dropdown.close()
      await this.$store.dispatch('fetchItems')
    },
    removeFilterHandler (index) {
      const deletedFilter = this.selectedColumns.splice(index, 1)[0]
      --this.length
      if (deletedFilter && deletedFilter.id) {
        delete deletedFilter.value
        delete deletedFilter.condition
      }
      this.setDisabledSearchBtn()
    }
  }
}
</script>

<style>
.filter-selector__header {
  display: flex;
  padding: 10px;
  position: sticky;
  top: -6px;
  background-color: white;
  z-index: 1;
  border-bottom: 1px solid hsl(var(--hs-border), var(--l-layout-border-default));
}
.filter-selector__header .u-button {
  margin-right: 10px;
}

.filter-selector .u-dropdown {
  max-height: 95vh;
  overflow: auto;
}
.filter-selector__count {
  flex-grow: 2;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.filter-selector__count span {
  padding: 4px;
  background-color: hsl(var(--hs-control), var(--l-state-hover));
  font-weight: 600;
  border-radius: 50%;
  color: hsl(var(--hs-text), var(--l-text-inverse));
  width: 25px;
  height: 25px;
  text-align: center;
}
.filter-selector__delimiter {
  width: 100%;
  margin: 10px 0;
  border-top: 2px solid hsl(var(--hs-border), var(--l-layout-border-light));
  position: relative;
}
.filter-selector__delimiter span {
  padding: 4px;
  min-width: 50px;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%) translateY(-60%);
  background: white;
  color: hsl(var(--hs-text), var(--l-text-description));
  text-align: center;
}
.filter-selector__header__btn .u-button__label:first-letter {
  text-transform: capitalize;
}
.filter-selector .filter-selector__delimiter:last-child {
  display: none;
}
</style>
