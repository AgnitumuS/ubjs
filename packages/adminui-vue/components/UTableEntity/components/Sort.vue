<template>
  <u-dropdown v-if="sortableColumns.length">
    <u-button
      icon="u-icon-sort-asc-alt"
      appearance="inverse"
      color="control"
    >
      {{ $ut('table.sort.label') }}
    </u-button>

    <div
      slot="dropdown"
      class="u-fake-table"
    >
      <div class="u-fake-table__tr">
        <div class="u-fake-table__td u-fake-table__label">
          {{ $ut('table.columnLabel') }}
        </div>
        <div class="u-fake-table__td">
          <el-select
            v-model="selectedColumnId"
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
        v-if="selectedColumnId !== null"
        class="u-fake-table__tr"
      >
        <div class="u-fake-table__td u-fake-table__label">
          {{ $ut('table.sort.direction.label') }}
        </div>
        <div class="u-fake-table__td">
          <u-button-group>
            <u-button
              v-for="sortOption in sortOptions"
              :key="sortOption.value"
              :icon="sortOption.icon"
              :color="sortOption.value === sortOrder ? 'primary' : 'control'"
              :appearance="sortOption.value === sortOrder ? 'default' : 'plain'"
              @click="sortOrder = sortOption.value"
            >
              {{ sortOption.label }}
            </u-button>
          </u-button-group>
        </div>
      </div>
    </div>
  </u-dropdown>
</template>

<script>
export default {
  name: 'UTableEntitySort',

  data () {
    return {
      sortOptions: [{
        label: this.$ut('table.sort.direction.asc'),
        value: 'asc',
        icon: 'u-icon-sort-asc-alt'
      }, {
        label: this.$ut('table.sort.direction.desc'),
        value: 'desc',
        icon: 'u-icon-sort-desc-alt'
      }, {
        label: this.$ut('table.sort.direction.none'),
        value: 'none'
      }]
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

    sortOrder: {
      get () {
        const { order, column } = /** @type {UTableSort} */ this.$store.state.sort || { order: 'none' }
        if (column === this.selectedColumnId) {
          return order
        }
        return 'none'
      },
      set (order) {
        if (order === 'none') {
          this.$store.dispatch('updateSort', null)
        }

        this.$store.dispatch('updateSort', {
          column: this.selectedColumnId,
          order
        })
      }
    }
  }
}
</script>
