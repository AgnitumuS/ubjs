<template>
  <div
    v-loading="loading"
    class="u-table-entity"
    tabindex="1"
    @keydown.exact="tryFocusFilter"
    @keydown.up.exact="moveUp"
    @keydown.down.exact="moveDown"
    @keydown.left.exact="moveLeft"
    @keydown.right.exact="moveRight"
    @keydown.enter.exact="onSelect(selectedRowId)"
    @keydown.ctrl.e.prevent.exact="editRecord(selectedRowId)"
    @keydown.ctrl.insert.exact="addNew"
    @keydown.ctrl.r.prevent.exact="refresh"
    @keydown.ctrl.delete.exact="deleteRecord(selectedRowId)"
  >
    <pre>
      {{$store.state.filters}}
    </pre>
    <div class="u-table-entity__head">
      <!-- @slot Replace whole toolbar -->
      <slot
        name="toolbar"
        :store="$store"
      >
        <!-- @slot Prepend new buttons to toolbar -->
        <slot
          name="toolbarPrepend"
          :store="$store"
          :close="close"
        />

        <u-toolbar-button
          color="secondary"
          icon="el-icon-refresh"
          @click="refresh"
        >
          {{ $ut('refresh') }}
        </u-toolbar-button>

        <!-- @slot Replace add-new button in toolbar panel -->
        <slot
          name="toolbarButtonAddNew"
          :store="$store"
          :close="close"
        >
          <u-toolbar-button
            icon="el-icon-plus"
            :disabled="!canAddNew"
            @click="addNew"
          >
            {{ $ut('actionAdd') }}
          </u-toolbar-button>
        </slot>

        <!-- @slot Prepend new buttons to toolbar before filter -->
        <slot
          name="toolbarAppend"
          :store="$store"
          :close="close"
        />

        <filter-container ref="filterContainer" />

        <pagination />

        <!-- @slot Replace whole toolbar dropdown -->
        <slot
          name="toolbarDropdown"
          :store="$store"
          :close="close"
        >
          <toolbar-dropdown :close="close">
            <!-- @slot Prepend new buttons to toolbar -->
            <slot
              slot="prepend"
              name="toolbarDropdownPrepend"
              :store="$store"
              :close="close"
            />

            <!-- @slot Replace add-new button in toolbar dropdown -->
            <slot
              slot="add-new"
              name="toolbarDropdownAddNew"
              :store="$store"
              :close="close"
            />
            <!-- @slot Replace edit button in toolbar dropdown -->
            <slot
              slot="edit"
              name="toolbarDropdownEdit"
              :store="$store"
              :close="close"
            />
            <!-- @slot Replace copy button in toolbar dropdown -->
            <slot
              slot="copy"
              name="toolbarDropdownCopy"
              :store="$store"
              :close="close"
            />
            <!-- @slot Replace delete button in toolbar dropdown -->
            <slot
              slot="delete"
              name="toolbarDropdownDelete"
              :store="$store"
              :close="close"
            />
            <!-- @slot Replace audit button in toolbar dropdown -->
            <slot
              slot="audit"
              name="toolbarDropdownAudit"
              :store="$store"
              :close="close"
            />

            <!-- @slot Append new buttons to toolbar -->
            <slot
              slot="append"
              name="toolbarDropdownAppend"
              :store="$store"
              :close="close"
            />
          </toolbar-dropdown>
        </slot>
      </slot>
    </div>

    <filter-list />

    <u-table
      ref="table"
      :columns="columns"
      :items="items"
      :get-column-class="getColumnClass"
      :get-row-class="getRowClass"
      :height="height"
      :max-height="maxHeight"
      :fixed-column-id="fixedColumnId"
      @dblclick-row="onSelect($event.row.ID, $event.row)"
      @click-cell="selectCell"
      @sort="updateSort"
      @contextmenu="showContextMenu"
    >
      <template
        v-for="col in columns"
        #[col.id]="{name, value, row}"
      >
        <slot
          :name="col.id"
          :value="row[col.id]"
          :row="row"
          :column="col"
        >
          <component
            :is="col.template()"
            v-if="typeof col.template === 'function'"
            :value="row[col.id]"
            :row="row"
            :column="col"
          />
          <template v-else>
            <div
              v-if="col.isHtml"
              :key="col.id"
              v-html="formatValue({ value: row[col.id], column: col, row })"
            />
            <template v-else>
              {{ formatValue({ value: row[col.id], column: col, row }) }}
            </template>
          </template>
        </slot>
      </template>
    </u-table>

    <context-menu ref="contextMenu" />
  </div>
</template>

<script>
const ContextMenu = require('./ContextMenu.vue').default
const FilterContainer = require('./FilterContainer.vue').default
const Pagination = require('./Pagination.vue').default
const { mapState, mapGetters, mapMutations, mapActions } = require('vuex')
const FilterList = require('./FilterList.vue').default
const ToolbarDropdown = require('./ToolbarDropdown.vue').default
const props = require('../props')
const formatValueMixin = require('../../controls/UTable/formatValueMixin')
/**
 * Replaced from function to global scope in case not to create a regular expression every function call.
 * Creating of regular expression is slow operation
 */
const regExpLetterOrNumber = /[A-Za-zА-Яа-я0-9]/

export default {
  name: 'UTableEntityRoot',

  components: {
    ContextMenu,
    FilterContainer,
    Pagination,
    FilterList,
    ToolbarDropdown
  },

  mixins: [formatValueMixin],

  props,

  inject: {
    close: {
      default: () => () => console.warn('Injection close didn\'t provided')
    }
  },

  computed: {
    ...mapState([
      'selectedColumnId',
      'items',
      'loading',
      'withTotal'
    ]),

    ...mapGetters([
      'canAddNew',
      'formCode',
      'columns'
    ]),

    selectedRowId: {
      get () {
        return this.$store.state.selectedRowId
      },
      set (value) {
        this.$store.commit('SELECT_ROW', value)
      }
    }
  },

  methods: {
    ...mapActions([
      'updateSort',
      'cellNavigate',
      'addNew',
      'editRecord',
      'deleteRecord',
      'refresh'
    ]),
    ...mapMutations([
      'SELECT_COLUMN',
      'SELECT_ROW'
    ]),

    /**
     * In a case when you create component by repository prop
     * and forgot to set attribute in fieldList but this attribute includes in columns
     */

    showContextMenu (event, row) {
      this.selectedRowId = row.ID
      this.$refs.contextMenu.show(event, row)
    },

    selectCell ({ row, column }) {
      this.SELECT_COLUMN(column.id)
      this.SELECT_ROW(row.ID)
    },

    getNextArrayValue (array, key, current) {
      const index = array.findIndex(i => current === i[key])
      const undefinedIndex = index === -1
      const isLast = index === (array.length - 1)
      if (undefinedIndex || isLast) {
        return array[0][key]
      } else {
        return array[index + 1][key]
      }
    },

    getPrevArrayValue (array, key, current) {
      const index = array.findIndex(i => current === i[key])
      const undefinedIndex = index === -1
      const isFirst = index === 0
      if (undefinedIndex) {
        return array[0][key]
      } else if (isFirst) {
        return array[array.length - 1][key]
      } else {
        return array[index - 1][key]
      }
    },

    moveUp () {
      this.SELECT_ROW(this.getPrevArrayValue(this.items, 'ID', this.selectedRowId))
      this.scrollIntoView()
    },
    moveDown () {
      this.SELECT_ROW(this.getNextArrayValue(this.items, 'ID', this.selectedRowId))
      this.scrollIntoView()
    },
    moveLeft () {
      this.SELECT_COLUMN(this.getPrevArrayValue(this.columns, 'id', this.selectedColumnId))
      this.scrollIntoView()
    },
    moveRight () {
      this.SELECT_COLUMN(this.getNextArrayValue(this.columns, 'id', this.selectedColumnId))
      this.scrollIntoView()
    },

    getColumnClass (column) {
      return column.id === this.selectedColumnId
        ? 'u-table-entity__selected__column'
        : ''
    },
    getRowClass (row) {
      return row.ID === this.selectedRowId
        ? 'u-table-entity__selected__row'
        : ''
    },

    async scrollIntoView () {
      await this.$nextTick()
      const table = this.$refs.table.$el
      const cell = table.querySelector('.u-table-entity__selected__row .u-table-entity__selected__column')
      if (cell) {
        cell.scrollIntoView({
          block: 'nearest',
          inline: 'nearest'
        })
      }
    },

    tryFocusFilter ({ key }) {
      if (key.length === 1 && regExpLetterOrNumber.test(key)) {
        const inputs = this.$refs.filterContainer.$el.querySelectorAll('input')
        if (inputs.length > 0) {
          inputs[inputs.length - 1].focus()
        }
      }
    },

    onSelect (ID, row) {
      if (this.onSelectRecord) {
        this.onSelectRecord({ ID, row, close: this.close })
      } else {
        this.editRecord(ID)
      }
    }
  }
}
</script>

<style>
.u-table-entity{
  display: flex;
  flex-direction: column;
}

.u-table-entity__head{
  background: rgb(var(--table-bg));
  padding: 0 8px;
  display: flex;
  align-items: center;
}

.u-table-entity-panel__table th > .cell {
  word-break: normal;
}

.u-table-entity .u-table th,
.u-table-entity .u-table td {
  user-select: none;
}

.u-table-entity .u-table-entity__selected__row td,
.u-table-entity .u-table-entity__selected__row:hover td{
  background: rgb(var(--table-selected-row));
}

.u-table-entity .u-table-entity__selected__row .u-table-entity__selected__column,
.u-table-entity .u-table-entity__selected__row td:hover,
.u-table-entity .u-table-entity__selected__row:hover .u-table-entity__selected__column{
  background: rgb(var(--table-selected-cell));
}

.u-table-entity__head__dropdown{
  align-self: center;
}
</style>
