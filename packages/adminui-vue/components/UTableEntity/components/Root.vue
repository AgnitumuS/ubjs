<template>
  <div
    v-loading="loading"
    class="u-table-entity"
    tabindex="1"
    @keydown.ctrl.delete.exact="deleteRecord(selectedRowId)"
    @keydown.ctrl.e.prevent.exact="editRecord(selectedRowId)"
    @keydown.ctrl.insert.exact="addNew"
    @keydown.ctrl.r.prevent.exact="refresh"
    @keydown.down.exact="moveDown"
    @keydown.enter.exact="onSelect(selectedRowId)"
    @keydown.exact="tryFocusFilter"
    @keydown.left.exact="moveLeft"
    @keydown.right.exact="moveRight"
    @keydown.up.exact="moveUp"
  >
    <div class="u-table-entity__head">
      <!-- @slot Replace whole toolbar -->
      <slot
        :store="$store"
        name="toolbar"
      >
        <!-- @slot Prepend new buttons to toolbar -->
        <slot
          :close="close"
          :store="$store"
          name="toolbarPrepend"
        />

        <u-toolbar-button
          icon="el-icon-refresh"
          color="secondary"
          @click="refresh"
        >
          {{ $ut('refresh') }}
        </u-toolbar-button>

        <!-- @slot Replace add-new button in toolbar panel -->
        <slot
          :close="close"
          :store="$store"
          name="toolbarButtonAddNew"
        >
          <u-toolbar-button
            :disabled="!canAddNew"
            icon="el-icon-plus"
            color="secondary"
            @click="addNew"
          >
            {{ $ut('actionAdd') }}
          </u-toolbar-button>
        </slot>

        <!-- @slot Prepend new buttons to toolbar before filter -->
        <slot
          :close="close"
          :store="$store"
          name="toolbarAppend"
        />

        <filter-container ref="filterContainer" />

        <pagination />

        <!-- @slot Replace whole toolbar dropdown -->
        <slot
          :close="close"
          :store="$store"
          name="toolbarDropdown"
        >
          <toolbar-dropdown :close="close">
            <!-- @slot Prepend new buttons to toolbar -->
            <slot
              slot="prepend"
              :close="close"
              :store="$store"
              name="toolbarDropdownPrepend"
            />

            <!-- @slot Replace add-new button in toolbar dropdown -->
            <slot
              slot="add-new"
              :close="close"
              :store="$store"
              name="toolbarDropdownAddNew"
            />
            <!-- @slot Replace edit button in toolbar dropdown -->
            <slot
              slot="edit"
              :close="close"
              :store="$store"
              name="toolbarDropdownEdit"
            />
            <!-- @slot Replace copy button in toolbar dropdown -->
            <slot
              slot="copy"
              :close="close"
              :store="$store"
              name="toolbarDropdownCopy"
            />
            <!-- @slot Replace delete button in toolbar dropdown -->
            <slot
              slot="delete"
              :close="close"
              :store="$store"
              name="toolbarDropdownDelete"
            />
            <!-- @slot Replace audit button in toolbar dropdown -->
            <slot
              slot="audit"
              :close="close"
              :store="$store"
              name="toolbarDropdownAudit"
            />
            <!-- @slot Replace exports button in toolbar dropdown -->
            <slot
              slot="exports"
              :close="close"
              :store="$store"
              name="toolbarDropdownExports"
            />

            <!-- @slot Append new buttons to toolbar -->
            <slot
              slot="append"
              :close="close"
              :store="$store"
              name="toolbarDropdownAppend"
            />
          </toolbar-dropdown>
        </slot>
      </slot>
    </div>

    <filter-list />

    <u-table
      ref="table"
      :columns="columns"
      :fixed-column-id="fixedColumnId"
      :get-column-class="getColumnClass"
      :get-row-class="getRowClass"
      :height="height"
      :items="items"
      :max-height="maxHeight"
      @click-cell="selectCell"
      @contextmenu-cell="showContextMenu"
      @dblclick-row="onSelect($event.row.ID, $event.row)"
      @sort="updateSort"
    >
      <template
        v-for="col in columns"
        #[col.id]="{name, value, row}"
      >
        <slot
          :column="col"
          :name="col.id"
          :row="row"
          :value="row[col.id]"
        >
          <component
            :is="getCellTemplate(col)"
            :column="col"
            :row="row"
            :value="row[col.id]"
          />
        </slot>
      </template>
    </u-table>

    <u-dropdown
      ref="contextMenu"
      class="u-table-entity__contextmenu-wrap"
    >
      <template slot="dropdown">
        <!-- @slot Prepend items in context menu -->
        <slot
          :close="close"
          :row-id="contextMenuRowId"
          :store="$store"
          name="contextMenuPrepend"
        />
        <!-- @slot Replace whole context menu -->
        <slot
          :close="close"
          :row-id="contextMenuRowId"
          :store="$store"
          name="contextMenu"
        >
          <!-- @slot Replace action "edit" in context menu -->
          <slot
            :close="close"
            :row-id="contextMenuRowId"
            :store="$store"
            name="contextMenuEditRecord"
          >
            <u-dropdown-item
              icon="el-icon-edit"
              label="Edit"
              @click="editRecord(contextMenuRowId)"
            />
          </slot>

          <!-- @slot Replace action "copy" in context menu -->
          <slot
            :close="close"
            :row-id="contextMenuRowId"
            :store="$store"
            name="contextMenuCopy"
          >
            <u-dropdown-item
              :disabled="!canAddNew"
              icon="el-icon-copy-document"
              label="Copy"
              @click="copyRecord(contextMenuRowId)"
            />
          </slot>

          <!-- @slot Replace action "delete" in context menu -->
          <slot
            :close="close"
            :row-id="contextMenuRowId"
            :store="$store"
            name="contextMenuDelete"
          >
            <u-dropdown-item
              :disabled="!canDelete"
              icon="el-icon-delete"
              label="Delete"
              @click="deleteRecord(contextMenuRowId)"
            />
          </slot>

          <!-- @slot Replace "copy link" in context menu -->
          <slot
            :close="close"
            :row-id="contextMenuRowId"
            :store="$store"
            name="contextMenuLink"
          >
            <u-dropdown-item
              icon="el-icon-link"
              label="link"
              @click="createLink(contextMenuRowId)"
            />
          </slot>

          <!-- @slot Replace "audit" in context menu -->
          <slot
            :close="close"
            :row-id="contextMenuRowId"
            :store="$store"
            name="contextMenuAudit"
          >
            <u-dropdown-item
              :disabled="!canAudit"
              icon="el-icon-data-analysis"
              label="Audit"
              @click="audit(contextMenuRowId)"
            />
          </slot>

          <!-- @slot Replace "detail records list" in context menu -->
          <slot
            :close="close"
            :row-id="contextMenuRowId"
            :store="$store"
            name="contextMenuDetails"
          />
        </slot>

        <!-- @slot Append items in context menu -->
        <slot
          :close="close"
          :row-id="contextMenuRowId"
          :store="$store"
          name="contextMenuAppend"
        />
      </template>
    </u-dropdown>
  </div>
</template>

<script>
const FilterContainer = require('./FilterContainer.vue').default
const Pagination = require('./Pagination.vue').default
const { mapState, mapGetters, mapMutations, mapActions } = require('vuex')
const FilterList = require('./FilterList.vue').default
const ToolbarDropdown = require('./ToolbarDropdown.vue').default
const TypeProvider = require('../type-provider')
/**
   * Replaced from function to global scope in case not to create a regular expression every function call.
   * Creating of regular expression is slow operation
   */
const regExpLetterOrNumber = /[A-Za-zА-Яа-я0-9]/

export default {
  name: 'UTableEntityRoot',

  components: {
    FilterContainer,
    Pagination,
    FilterList,
    ToolbarDropdown
  },

  props: {
    /**
       * If set table will be have static height.
       * Table container will be have own scroll and fixed header.
       */
    height: [Number, String],

    /**
       * If set table will be have maxHeight.
       * Table container will be have own scroll and fixed header.
       */
    maxHeight: [Number, String],

    /**
       * Id of column which will stack when we scroll table by horizontal.
       */
    fixedColumnId: String,
    /**
       * Overrides the record selection event. That is, double click or enter
       * @type {function({ID: Number, row: Object, close: function})}
       */
    onSelectRecord: Function
  },

  inject: {
    close: {
      default: () => () => console.warn('Injection close didn\'t provided')
    }
  },

  data () {
    return {
      contextMenuRowId: null
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
      'canDelete',
      'canAudit',
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

  watch: {
    selectedRowId (id) {
      this.$emit('change-row', id)
    }
  },

  methods: {
    ...mapActions([
      'updateSort',
      'cellNavigate',
      'addNew',
      'editRecord',
      'deleteRecord',
      'refresh',
      'copyRecord',
      'createLink',
      'audit'
    ]),
    ...mapMutations([
      'SELECT_COLUMN',
      'SELECT_ROW'
    ]),

    getCellTemplate (column) {
      if (typeof column.template === 'function') {
        return column.template()
      } else {
        const dataType = column.attribute && column.attribute.dataType
        return TypeProvider.get(dataType).template
      }
    },

    showContextMenu ({ event, row, column }) {
      this.selectCell({ row, column })
      this.contextMenuRowId = row.ID
      this.$refs.contextMenu.show(event)
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
      if (this.selectedRowId === null) return
      this.SELECT_ROW(this.getPrevArrayValue(this.items, 'ID', this.selectedRowId))
      this.scrollIntoView()
    },
    moveDown () {
      if (this.selectedRowId === null) return
      this.SELECT_ROW(this.getNextArrayValue(this.items, 'ID', this.selectedRowId))
      this.scrollIntoView()
    },
    moveLeft () {
      if (this.selectedColumnId === null) return
      this.SELECT_COLUMN(this.getPrevArrayValue(this.columns, 'id', this.selectedColumnId))
      this.scrollIntoView()
    },
    moveRight () {
      if (this.selectedColumnId === null) return
      this.SELECT_COLUMN(this.getNextArrayValue(this.columns, 'id', this.selectedColumnId))
      this.scrollIntoView()
    },

    getColumnClass (column) {
      return column.id === this.selectedColumnId
        ? 'selected'
        : ''
    },
    getRowClass (row) {
      return row.ID === this.selectedRowId
        ? 'selected'
        : ''
    },

    async scrollIntoView () {
      await this.$nextTick()
      const table = this.$refs.table.$el
      const cell = table.querySelector('tr.selected td.selected')
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
  .u-table-entity {
    --row-selected: hsl(var(--hs-primary), var(--l-background-default));
    --cell-selected: hsl(var(--hs-primary), var(--l-background-active));
    --row-selected-border: hsl(var(--hs-primary), var(--l-layout-border-default));

    display: flex;
    flex-direction: column;
  }

  .u-table-entity__head {
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

  .u-table-entity tr.selected td {
    background: var(--row-selected);
    border-bottom-color: var(--row-selected-border);
  }

  .u-table-entity tr.selected td.selected,
  .u-table-entity tr.selected td:hover,
  .u-table-entity tr.selected:hover td.selected {
    background: var(--cell-selected);
  }

  .u-table-entity__head__dropdown {
    align-self: center;
  }

  .u-table-entity__contextmenu-wrap {
    height: 0;
  }
</style>
