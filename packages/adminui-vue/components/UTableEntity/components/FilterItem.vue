<template>
  <div class="u-fake-table filter-item">
    <div class="u-fake-table__body">
      <div class="u-fake-table__tr">
        <div class="u-fake-table__td u-fake-table__label">
          {{ $ut('table.columnLabel') }}
        </div>
        <div class="u-fake-table__td">
          <el-select
            v-model="selectedFilterableColumnId"
            :placeholder="$ut('table.filter.columnPlaceholder')"
          >
            <el-option
              v-for="column in currentColumns"
              :key="column.id"
              :value="column.id"
              :label="$ut(column.label)"
            />
          </el-select>
        </div>
      </div>
      <template v-if="selectedFilterableColumnId">
        <div class="u-fake-table__tr">
          <div class="u-fake-table__td u-fake-table__label">
            {{ $ut('table.filter.conditionPlaceholder') }}
          </div>
          <div class="u-fake-table__td">
            <el-select
              v-model="condition"
              :placeholder="$ut('table.filter.conditionPlaceholder')"
            >
              <el-option
                v-for="(filterData, filterId) in selectedColumn.filters"
                :key="filterId"
                :value="filterId"
                :label="$ut(filterData.label)"
              />
            </el-select>
          </div>
        </div>
        <component
          :is="selectedColumn.filters[condition].template"
          v-if="selectedColumn.filters && selectedColumn.filters[condition]"
          ref="searchComponent"
          :key="selectedColumn.id"
          class="filter-item__value-comp"
          :column="selectedColumn"
          :default-value="selectedColumn.value"
          @search-disabled="searchDisabled"
          @keyup.enter.native="pressEnterHandler"
        />
      </template>
    </div>
    <div class="u-fake-table__header">
      <u-icon
        v-if="canRemove"
        class="u-fake-table--icon"
        color="danger"
        icon="u-icon-delete"
        :title="$ut('Delete')"
        size="small"
        @click.native.stop="$emit('remove-filter')"
      />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    columns: {
      type: Array,
      default: () => {
        return []
      }
    },
    selectedColumn: {
      type: Object,
      default: () => ({})
    },
    canRemove: {
      type: Boolean,
      default: false
    },
    searchDisabled: {
      type: Function,
      default: () => {
        return () => {}
      }
    }
  },
  data () {
    return {
      conditionsByColumns: {}
    }
  },
  computed: {
    currentColumns () {
      const result =
        Object.keys(this.selectedColumn).length > 0
          ? [this.selectedColumn, ...this.columns]
          : this.columns
      return result
    },
    selectedColumnId: {
      get () {
        return this.$store.state.selectedColumnId
      },

      set (value) {
        this.$store.commit('SELECT_COLUMN', value)
      }
    },

    selectedFilterableColumnId: {
      get () {
        return this.selectedColumn.id || null
      },

      set (value) {
        this.$emit('selected-column', value)
        this.selectedColumnId = !!value
      }
    },

    condition: {
      get () {
        return this.conditionsByColumns[this.selectedFilterableColumnId]
      },

      set (value) {
        this.conditionsByColumns[this.selectedFilterableColumnId] = value
      }
    }
  },
  watch: {
    condition (e) {
      if (!e) {
        this.searchDisabled(false)
        return
      }
      const comp = this.$refs.searchComponent
      const flag = comp.isEmpty
      this.searchDisabled(flag)
    },
    selectedColumn: function (value) {
      this.selectedColumnId = value.id
    }
  },
  created () {
    this.init()
    if (this.selectedColumn.condition !== undefined) {
      this.condition = this.selectedColumn.condition
    }
  },
  methods: {
    pressEnterHandler (ev) {
      const { target } = ev
      const selectors = ['.u-select', '.ub-select-multiple__container']
      const isSelect = selectors.some(selector => target.closest(selector))
      if (isSelect) return
      this.$emit('go-search')
    },
    init () {
      this.$set(this, 'conditionsByColumns', {})
      for (const column of this.currentColumns) {
        this.$set(
          this.conditionsByColumns,
          column.id,
          Object.keys(column.filters)[0]
        )
      }
    }
  }
}
</script>

<style>
.u-fake-table.filter-item {
  display: flex;
  align-items: center;
}
.u-fake-table.filter-item .u-fake-table__tbody .u-button {
  display: none;
}

.u-fake-table.filter-item .u-fake-table__label {
  white-space: nowrap;
}
.u-fake-table.filter-item .u-fake-table__td .el-range-editor.el-input__inner {
  max-width: 100%;
}
.u-fake-table.filter-item .u-fake-table__td {
  max-width: 250px;
}
.u-fake-table.filter-item .u-fake-table__td.u-fake-table__label {
  display: none;
}

.u-fake-table__header .u-icon_size-small {
  font-size: 14px;
  cursor: pointer;
}
.filter-item__value-comp .u-fake-table__tr:last-child {
  display: none;
}
</style>
