<template>
  <div
    class="u-table"
    :class="{
      'u-table__multiple': showMultiSelectionColumn,
      'u-table--sort': sorting
    }"
    :style="tableStyle"
  >
    <table>
      <tr>
        <th
          v-if="showMultiSelectionColumn"
          @click="handlerCheckedAll"
        >
          <span
            class="el-checkbox__input"
            :class="{
              'is-checked': allSelected,
              'is-indeterminate': !allSelected && curSelection.length > 0
            }"
          >
            <span class="el-checkbox__inner" />
            <input
              type="checkbox"
              aria-hidden="false"
              class="el-checkbox__original"
            >
          </span>
        </th>
        <th
          v-for="col in columns"
          :key="col.id"
          :class="[
            { 'u-table__fixed-column': col.id === fixedColumnId },
            getAlignClass(col.headerAlign),
            columnsClasses[col.id]
          ]"
          :style="{
            maxWidth: col.maxWidth && col.maxWidth + 'px',
            minWidth: col.minWidth && col.minWidth + 'px',
            width: col.width && col.width + 'px',
            padding: col.padding && col.padding + 'px'
          }"
          @click="$emit('click-head-cell', col, $event.target)"
        >
          <slot
            :name="`head_${col.id}`"
            :column="col"
          >
            {{ formatHead({ column: col }) }}
          </slot>
          <!-- TODO: implement sorting in another branch -->
          <!-- <span
            v-if="sorting"
            class="u-table__sort"
          >
            <u-icon
              icon="u-icon-sort-asc"
              size="small"
              :color="
                col.id === sortCol && sortDirection === 'asc' ? 'primary' : 'control'
              "
              @click.native="doSort(col, 'asc')"
            />
            <u-icon
              icon="u-icon-sort-desc"
              size="small"
              :color="
                col.id === sortCol && sortDirection === 'desc' ? 'primary' : 'control'
              "
              @click.native="doSort(col, 'desc')"
            />
          </span> -->
        </th>
      </tr>
      <tr
        v-for="row in items"
        :key="row[multiSelectKeyAttr]"
        :class="[
          getRowClass(row),
          { 'selected-row': curSelection.includes(row[multiSelectKeyAttr]) }
        ]"
        @dblclick="$emit('dblclick-row', { row })"
        @click="$emit('click', { row })"
      >
        <td
          v-if="showMultiSelectionColumn"
          @click="handlerSelection(row)"
        >
          <!-- repeat html-structure for el-checkbox ElementUI -->
          <span
            class="el-checkbox__input"
            :class="{
              'is-checked': curSelection.includes(row[multiSelectKeyAttr])
            }"
          >
            <span class="el-checkbox__inner" />
            <input
              type="checkbox"
              aria-hidden="false"
              class="el-checkbox__original"
            >
          </span>
        </td>
        <td
          v-for="col in columns"
          :key="col.id"
          :class="[
            {
              'u-table__fixed-column': col.id === fixedColumnId
            },
            getAlignClass(col.align),
            columnsClasses[col.id],
            getCellClass(row, col)
          ]"
          :style="{
            padding: col.padding && col.padding + 'px'
          }"
          @click="$emit('click-cell', { row, column: col })"
          @contextmenu="
            $emit('contextmenu-cell', { event: $event, row, column: col })
          "
        >
          <div class="u-table__cell-container">
            <slot
              :name="col.id"
              :value="row[col.id]"
              :row="row"
              :column="col"
            >
              {{ formatValue({ value: row[col.id], column: col, row }) }}
            </slot>
          </div>
        </td>
      </tr>
      <!-- @slot Last row in table -->
      <slot name="lastTableRow" />
    </table>

    <div
      v-if="items.length === 0"
      class="u-table-no-data"
    >
      {{ $ut('UTable.noData') }}
    </div>
    <!-- @slot Table footer -->
    <slot name="appendTable" />
  </div>
</template>

<script>
/**
 * Component that allows to display data in a tabular manner
 *
 */
const selectionLogic = require('../mixins/selection/logic')

export default {
  name: 'UTable',

  mixins: [require('./formatValueMixin'), selectionLogic],

  props: {
    /**
     * column settings. For details about column object see JSDoc type {UTableColumnSettings}
     */
    columns: {
      type: Array,
      required: true
    },

    /**
     * ID of the column what will be locked on the left side when table is scrolled horizontally
     */
    fixedColumnId: String,

    /**
     * Table data
     */
    items: {
      type: Array,
      required: true
    },

    /**
     * function that accept a column config as a parameter and returns a custom class names, what will be assigned to all column cells (<td>).
     * Called once for each column.
     *
     * @param {UTableColumn} column Configuration of a column
     */
    getColumnClass: {
      type: Function,
      default () {
        return ''
      }
    },

    /**
     * function that accept a row data as a parameter and returns a custom class names for row (<tr>)
     *
     * @param {object} row A table row data
     */
    getRowClass: {
      type: Function,
      default () {
        return ''
      }
    },

    /**
     * function that accept a row data and column config as a parameters and returns custom class names for a cell
     *
     * **WARNING** Do not use complex calculations since the method is called for each cell separately
     *
     * @param {object} row Current row
     * @param {UTableColumn} column Current column
     */
    getCellClass: {
      type: Function,
      default () {
        return ''
      }
    },

    /**
     * sets fixed table height. If data not fits, scroll is appears
     */
    height: [Number, String],

    /**
     * sets max table height. If data not fits, scroll is appears
     */
    maxHeight: [Number, String],
    /**
     * (WIP:) enable sort mode for table. Default `false`. Sorting in the browser
     */
    sorting: { type: Boolean, default: false },
    /**
     * options for sorting.
     *
     * `col` -  the column by which the sorting will be.
     *
     * `direction` - sorting direction. "asc" or "desc"
     */
    initialSorting: { type: Object, default: () => ({}) }
  },
  data () {
    return {
      sortDirection: '',
      sortCol: ''
    }
  },
  computed: {
    tableStyle () {
      return ['height', 'maxHeight'].reduce((style, prop) => {
        const value = this[prop]
        if (value) {
          style.overflow = 'auto'

          if (typeof value === 'number') {
            style[prop] = value + 'px'
          } else {
            style[prop] = value
          }
        }
        return style
      }, {})
    },

    columnsClasses () {
      return this.columns.reduce((accum, column) => {
        accum[column.id] = this.getColumnClass(column)
        return accum
      }, {})
    }
  },
  watch: {
    items: async function () {
      await this.$nextTick()
      this.setTitle()
    }
  },
  async mounted () {
    await this.$nextTick()
    if (this.sorting) this.initSort()
  },
  methods: {
    initSort () {
      const { initialSorting } = this
      if (Object.keys(initialSorting).length !== 2) return
      const col = this.columns.find(i => i.id === initialSorting.col)
      this.doSort(col, initialSorting.direction)
    },
    doSort (col, direction = 'asc') {
      const { items } = this
      const fieldName = col.id
      this.sortDirection = direction
      this.sortCol = fieldName
      items.sort((a, b) => {
        const index = this.$UB.formatter.collationCompare(a[fieldName], b[fieldName])
        return direction === 'desc' ? index * -1 : index
      })
    },
    getAlignClass (align = 'left') {
      return `u-table__cell__align-${align}`
    },
    setTitle () {
      const cells = this.$el.querySelectorAll(
        '.u-table__cell-container:not(title)'
      )
      if (!cells) return
      cells.forEach(cell => {
        if (
          cell.offsetHeight < cell.scrollHeight ||
          cell.offsetWidth < cell.scrollWidth
        ) {
          cell.setAttribute('title', cell.innerText)
        }
      })
    }
  }
}
</script>

<style>
.u-table {
  --border: hsl(var(--hs-border), var(--l-layout-border-default));
  --text: hsl(var(--hs-text), var(--l-text-default));
  --header-text: hsl(var(--hs-text), var(--l-text-label));
  --border-hover: hsl(var(--hs-border), var(--l-layout-border-light));
  --row-hover: hsl(var(--hs-background), var(--l-background-default));
  --cell-hover: hsl(var(--hs-background), var(--l-background-active));
}

.u-table table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.u-table__cell__align-left {
  text-align: left;
}
.u-table__cell__align-center {
  text-align: center;
}
.u-table__cell__align-right {
  text-align: right;
}

.u-table td,
.u-table th {
  border-bottom: 1px solid var(--border);
  color: var(--text);
  padding: 10px 8px;
  font-size: 16px;
  position: relative;
  letter-spacing: 0.3px;
  font-weight: 400;
  background: hsl(var(--hs-background), var(--l-background-inverse));
}

.u-table th {
  padding-left: 10px;
}

.u-table__cell-container {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.u-table th {
  top: 0;
  z-index: 1;
  position: sticky;
  color: var(--header-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.u-table th:after {
  content: '';
  width: 1px;
  height: 28px;
  position: absolute;
  top: calc(50% - 14px);
  right: 0;
  background: var(--border);
}

.u-table th:last-child:after {
  content: none;
}

.u-table th.u-table__fixed-column,
.u-table td.u-table__fixed-column {
  left: 0;
  position: sticky;
  z-index: 2;
}

.u-table th.u-table__fixed-column {
  z-index: 3;
}

.u-table tr:hover td {
  background: var(--row-hover);
  border-bottom-color: var(--border-hover);
}

.u-table tr td:hover {
  background: var(--cell-hover);
}

.u-table_border {
  box-shadow: var(--box-shadow-default);
  border: 1px solid hsl(var(--hs-border), var(--l-layout-border-default));
  border-bottom: none;
}

.u-table-no-data {
  color: hsl(var(--hs-text), var(--l-text-disabled));
  font-size: 16px;
  padding: 16px;
  width: 100%;
}
.u-table--sort.u-table th {
  padding-right: 20px;
}
.u-table__sort {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  cursor: pointer;
}
.u-table__sort i {
  font-size: 12px;
}
</style>
