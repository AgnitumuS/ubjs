<template>
  <u-dropdown
    v-if="sortableColumns.length"
    ref="dropdown"
    :ref-element="targetColumn"
  >
    <u-button
      :title="$ut('table.sort.label')"
      icon="u-icon-sort-asc-alt"
      appearance="inverse"
      color="control"
    />

    <div
      slot="dropdown"
      class="u-fake-table"
    >
      <div
        v-if="!isColSortRegime"
        class="u-fake-table__tr"
      >
        <div class="u-fake-table__td u-fake-table__label">
          {{ $ut('table.columnLabel') }}
        </div>
        <div class="u-fake-table__td">
          <el-select
            v-model="selectedSortableColumnId"
            :placeholder="$ut('table.filter.columnPlaceholder')"
          >
            <el-option
              v-for="column in sortableColumns"
              :key="column.id"
              :value="column.id"
              :label="$ut(column.label)"
            />
          </el-select>
        </div>
      </div>

      <div
        v-if="selectedSortableColumnId !== null && !isColSortRegime"
        class="u-fake-table__tr"
      >
        <div class="u-fake-table__td u-fake-table__label">
          {{ $ut('table.sort.direction.label') }}
        </div>
        <div class="u-fake-table__td">
          <sort-popup
            :sort-order="sortOrder"
            @select-sort="selectSort"
          />
        </div>
      </div>
      <div v-if="selectedSortableColumnId !== null && isColSortRegime">
        <sort-popup
          :sort-order="sortOrder"
          direction="vertical"
          @select-sort="selectSort"
        />
      </div>
    </div>
  </u-dropdown>
</template>

<script>
const SortPopup = require('./SortPopup.vue').default

export default {
  name: 'UTableEntitySort',
  components: { SortPopup },
  props: {
    /**
     * The target column for positioning the sorting popup.
     */
    targetColumn: {
      default: null
    }
  },

  computed: {
    sortableColumns () {
      return this.$store.getters.columns.filter(column => column.sortable)
    },

    selectedColumnId: {
      get () {
        return this.$store.state.selectedColumnId
      },
      set (value) {
        this.$store.commit('SELECT_COLUMN', value)
      }
    },

    selectedSortableColumnId: {
      get () {
        const column = this.sortableColumns.find(
          column => column.id === this.selectedColumnId
        )

        return column ? column.id : null
      },

      set (value) {
        this.selectedColumnId = value
      }
    },

    sortOrder: {
      get () {
        const { order, column } = /** @type {UTableSort} */ this.$store.state
          .sort || { order: 'none' }
        if (column === this.selectedSortableColumnId) {
          return order
        }
        return 'none'
      },
      set (order) {
        if (order === 'none') {
          this.$store.dispatch('updateSort', null)
        } else {
          this.$store.dispatch('updateSort', {
            column: this.selectedSortableColumnId,
            order
          })
        }
      }
    },

    isColSortRegime () {
      return this.targetColumn !== null
    }
  },

  methods: {
    closeDropdown () {
      this.$refs.dropdown.visible = false
    },

    selectSort (sortOrder) {
      this.closeDropdown()
      this.sortOrder = sortOrder
    }
  }
}
</script>
