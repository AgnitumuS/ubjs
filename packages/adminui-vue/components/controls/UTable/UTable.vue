<template>
  <div
    class="u-table"
    :class="{
      'u-table--sort': sorting
    }"
    :style="tableStyle"
  >
    <u-dropdown
      v-show="sorting && targetColumn"
      ref="dropdown"
      :ref-element="targetColumn"
    >
      <div slot="dropdown">
        <sort-popup
          :sort-order="sortOrderInPopup"
          direction="vertical"
          @select-sort="handlerSelectSort"
        />
      </div>
    </u-dropdown>
    <table
      ref="content"
      tabindex="1"
      @keydown.down="toArrowPressHandler($event, 'down')"
      @keydown.up="toArrowPressHandler($event, 'up')"
    >
      <tr>
        <th
          v-if="preMultiSelectionColumn"
          :class="[
            { 'u-table__fixed-column': preMultiSelectionColumn.id === fixedColumnId },
            getAlignClass(preMultiSelectionColumn.headerAlign),
            columnsClasses[preMultiSelectionColumn.id]
          ]"
          :style="{
            maxWidth: preMultiSelectionColumn.maxWidth && preMultiSelectionColumn.maxWidth + 'px',
            minWidth: preMultiSelectionColumn.minWidth && preMultiSelectionColumn.minWidth + 'px',
            width: preMultiSelectionColumn.width && preMultiSelectionColumn.width + 'px',
            padding: preMultiSelectionColumn.padding && preMultiSelectionColumn.padding + 'px'
          }"
          @click="handlerClickOnHeadCell($event, preMultiSelectionColumn)"
        >
          <slot
            :name="`head_${preMultiSelectionColumn.id}`"
            :column="preMultiSelectionColumn"
          >
            {{ formatHead({ column: preMultiSelectionColumn }) }}
          </slot>
          <i
            v-if="sorting && columnCashedId === preMultiSelectionColumn.id"
            :key="preMultiSelectionColumn.id"
            :class="{
              'u-icon-sort-asc': sortOrder === 'asc',
              'u-icon-sort-desc': sortOrder === 'desc'
            }"
          />
        </th>

        <th
          v-if="showMultiSelectionColumn"
          class="u-table__multiple-column-head u-table__multiple__cell"
          tabindex="1"
          @click="checkedAllHandler"
          @keydown.space="checkedAllHandler"
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
          v-for="col in afterMultiSelectionColumns"
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
          @click="handlerClickOnHeadCell($event, col)"
        >
          <slot
            :name="`head_${col.id}`"
            :column="col"
          >
            {{ formatHead({ column: col }) }}
          </slot>
          <i
            v-if="sorting && columnCashedId === col.id"
            :key="col.id"
            :class="{
              'u-icon-sort-asc': sortOrder === 'asc',
              'u-icon-sort-desc': sortOrder === 'desc'
            }"
          />
        </th>
      </tr>
      <tr
        v-for="(row, rowIndex) in items"
        :key="row[multiSelectKeyAttr]"
        :class="[
          getRowClass(row),
          {
            'selected-row': curSelection.includes(row[multiSelectKeyAttr]),
            'selected': hoverIndex === rowIndex
          }
        ]"
        tabindex="1"
        @dblclick="$emit('dblclick-row', { row })"
        @click="onTableRowClickHandler(rowIndex)"
        @keydown.space="handlerSelection(row, $event)"
        @focus="hoverIndex = rowIndex"
      >
        <td
          v-if="preMultiSelectionColumn"
          :class="[
            { 'u-table__fixed-column': preMultiSelectionColumn.id === fixedColumnId },
            getAlignClass(preMultiSelectionColumn.align),
            columnsClasses[preMultiSelectionColumn.id],
            getCellClass(row, preMultiSelectionColumn)
          ]"
          :style="{
            padding: preMultiSelectionColumn.padding && preMultiSelectionColumn.padding + 'px'
          }"
          @click="$emit('click-cell', { row, column: preMultiSelectionColumn })"
          @contextmenu="contextMenuEventHandler($event, row, preMultiSelectionColumn)"
        >
          <div class="u-table__cell-container">
            <slot
              :name="preMultiSelectionColumn.id"
              :value="row[preMultiSelectionColumn.id]"
              :row="row"
              :column="preMultiSelectionColumn"
            >
              {{ formatValue({ value: row[preMultiSelectionColumn.id], column: preMultiSelectionColumn, row }) }}
            </slot>
          </div>
        </td>

        <td
          v-if="showMultiSelectionColumn"
          class="u-table__multiple__cell"
          @click="onInputClickHandler(row, $event)"
          @contextmenu="contextMenuEventHandler($event, row)"
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
          v-for="col in afterMultiSelectionColumns"
          :key="col.id"
          :class="[
            { 'u-table__fixed-column': col.id === fixedColumnId },
            getAlignClass(col.align),
            columnsClasses[col.id],
            getCellClass(row, col)
          ]"
          :style="{
            padding: col.padding && col.padding + 'px'
          }"
          @click="$emit('click-cell', { row, column: col })"
          @contextmenu="contextMenuEventHandler($event, row, col)"
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
const SortPopup = require('./SortPopup.vue').default
const sortingMixin = require('./sortingMixin')
const selectionLogic = require('../mixins/selection/logic')

export default {
  name: 'UTable',

  components: { SortPopup },

  mixins: [require('./formatValueMixin'), selectionLogic, sortingMixin],

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
    fixedColumnId: {
      type: String,
      require: false,
      default: ''
    },

    /**
     * ID of the column what will be displayed before the multi selection column
     */
    preMultiSelectionColumnId: {
      type: String,
      require: false,
      default: ''
    },

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
    height: {
      type: [Number, String],
      default: undefined
    },

    /**
     * sets max table height. If data not fits, scroll is appears
     */
    maxHeight: {
      type: [Number, String],
      default: undefined
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
      return Object.fromEntries(
        this.columns.map(column => [column.id, this.getColumnClass(column)])
      )
    },

    preMultiSelectionColumn () {
      return (this.showMultiSelectionColumn && this.preMultiSelectionColumnId)
        ? this.columns.find(column => column.id === this.preMultiSelectionColumnId)
        : null
    },

    afterMultiSelectionColumns () {
      return this.preMultiSelectionColumn ? this.columns.filter(column => column !== this.preMultiSelectionColumn) : this.columns
    }
  },

  watch: {
    items () {
      if (this.sorting && !this.sortingProcess && Number.isInteger(this.columnCashedId)) {
        this.createPrivateSortOrder()
        this.changeSorting(this.columnCashedId, this.sortOrder)
      }
      this.$nextTick().then(this.setTitle)
    }
  },

  mounted () {
    this.setTitle()
  },

  methods: {
    getAlignClass (align = 'left') {
      return `u-table__cell__align-${align}`
    },

    setTitle () {
      const cells = this.$el.querySelectorAll(
        '.u-table__cell-container:not(title)'
      )
      if (!cells) {
        return
      }

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
  --row-selected: hsl(var(--hs-primary), var(--l-background-active));
  --cell-selected: hsl(var(--hs-primary), calc(var(--l-background-active) - 7%));
  --row-selected-border: hsl(var(--hs-primary), var(--l-layout-border-default));
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
.u-table tr.selected td {
  background: var(--row-selected);
  border-bottom-color: var(--row-selected-border);
}

.u-table tr.selected td.selected,
.u-table tr.selected td:hover,
.u-table tr.selected:hover td.selected {
  background: var(--cell-selected);
}

.u-table__multiple__cell {
  cursor: pointer;
  text-align: center;
}

.u-table__multiple__cell:focus .el-checkbox__inner {
  outline: 2px solid hsl(var(--hs-primary), var(--l-layout-border-default));
}

th.u-table__multiple-column-head {
  z-index: 2;
}

</style>
