<template>
  <div
    v-loading="loading"
    class="u-table-entity"
    tabindex="1"
    @keydown.ctrl.delete.exact="canDelete && deleteRecord(selectedRowId)"
    @keydown.ctrl.e.prevent.exact="canEdit && editRecord(selectedRowId)"
    @keydown.ctrl.insert.exact="canAddNew && addNew()"
    @keydown.ctrl.r.prevent.exact="!loading && refresh()"
    @keydown.enter.exact="onSelect(selectedRowId)"
    @keydown.left.prevent.exact="move('left')"
    @keydown.right.prevent.exact="move('right')"
    @keydown.up.prevent.exact="move('up')"
    @keydown.down.prevent.exact="move('down')"
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

        <el-tooltip
          :content="$ut('refresh')"
          placement="bottom"
          :open-delay="300"
          :enterable="false"
        >
          <u-button
            appearance="inverse"
            icon="u-icon-refresh"
            color="control"
            :disabled="loading"
            @click="refresh"
          >
            {{ $ut('refresh') }}
          </u-button>
        </el-tooltip>

        <!-- @slot Replace add-new button in toolbar panel -->
        <slot
          :close="close"
          :store="$store"
          name="toolbarButtonAddNew"
        >
          <el-tooltip
            :content="$ut('actionAdd')"
            placement="bottom"
            :open-delay="300"
            :enterable="false"
          >
            <u-button
              appearance="inverse"
              :disabled="!canAddNew"
              icon="u-icon-add"
              color="control"
              @click="addNew"
            >
              {{ $ut('actionAdd') }}
            </u-button>
          </el-tooltip>
        </slot>

        <!-- @slot Prepend new buttons to toolbar before filter -->
        <slot
          :close="close"
          :store="$store"
          name="toolbarAppend"
        />

        <filter-selector />
        <sort ref="sort" />
        <pagination />

        <!-- @slot Replace whole toolbar dropdown -->
        <slot
          :close="close"
          :store="$store"
          name="toolbarDropdown"
        >
          <toolbar-dropdown :close="close">
            <!-- @slot Prepend new buttons to toolbar -->
            <template #prepend>
              <slot
                :close="close"
                :store="$store"
                name="toolbarDropdownPrepend"
              />
            </template>

            <!-- @slot Replace add-new button in toolbar dropdown -->
            <template #add-new>
              <slot
                :close="close"
                :store="$store"
                name="toolbarDropdownAddNew"
              />
            </template>
            <!-- @slot Replace edit button in toolbar dropdown -->
            <template #edit>
              <slot
                :close="close"
                :store="$store"
                name="toolbarDropdownEdit"
              />
            </template>
            <!-- @slot Replace copy button in toolbar dropdown -->
            <template #copy>
              <slot
                :close="close"
                :store="$store"
                name="toolbarDropdownCopy"
              />
            </template>
            <!-- @slot Replace delete button in toolbar dropdown -->
            <template #delete>
              <slot
                :close="close"
                :store="$store"
                name="toolbarDropdownDelete"
              />
            </template>
            <!-- @slot Replace audit button in toolbar dropdown -->
            <template #audit>
              <slot
                :close="close"
                :store="$store"
                name="toolbarDropdownAudit"
              />
            </template>
            <!-- @slot Replace exports button in toolbar dropdown -->
            <template #exports>
              <slot
                :close="close"
                :store="$store"
                name="toolbarDropdownExports"
              />
            </template>

            <!-- @slot Replace viewMode button in toolbar dropdown -->
            <template #viewMode>
              <slot
                :close="close"
                :store="$store"
                name="toolbarDropdownViewMode"
              >
                <u-dropdown-item
                  label="table.viewMode.label"
                  icon="u-icon-eye"
                >
                  <u-dropdown-item
                    :disabled="viewMode === 'table'"
                    label="table.viewMode.table"
                    icon="u-icon-grid"
                    @click="viewMode = 'table'"
                  />
                  <u-dropdown-item
                    :disabled="viewMode === 'card'"
                    label="table.viewMode.card"
                    icon="u-icon-attributes"
                    @click="viewMode = 'card'"
                  />
                </u-dropdown-item>
              </slot>
            </template>

            <template #summary>
              <slot
                :close="close"
                :store="$store"
                name="toolbarDropdownSummary"
              />
            </template>

            <!-- @slot Append new buttons to toolbar -->
            <template #append>
              <slot
                name="toolbarDropdownAppend"
                :close="close"
                :store="$store"
              />
            </template>
          </toolbar-dropdown>
        </slot>
      </slot>
    </div>

    <filter-list />

    <u-table
      v-if="viewMode === 'table'"
      ref="table"
      :columns="columns"
      :fixed-column-id="fixedColumnId"
      :get-column-class="getColumnClass"
      :get-row-class="getRowClass"
      :height="height"
      :items="items"
      :max-height="maxHeight"
      tabindex="1"
      @click-head-cell="showSortDropdown"
      @click-cell="select"
      @contextmenu-cell="showContextMenu"
      @dblclick-row="onSelect($event.row.ID, $event.row)"
    >
      <template
        v-for="column in columns"
        #[`head_${column.id}`]
      >
        <slot
          :column="column"
          :name="`head_${column.id}`"
        >
          {{ $ut(column.label) }}
          <i
            v-if="sort"
            :class="getSortIconClass(column.id)"
          />
        </slot>
      </template>

      <template
        v-for="column in columns"
        #[column.id]="{row, value}"
      >
        <slot
          :column="column"
          :name="column.id"
          :row="row"
          :value="value"
        >
          <component
            :is="getCellTemplate(column)"
            :column="column"
            :row="row"
            :value="row[column.id]"
          />
        </slot>
      </template>

      <next-page-button slot="appendTable" />
    </u-table>

    <u-card-view
      v-if="viewMode === 'card'"
      ref="cardView"
      :columns="cardColumns"
      :items="items"
      :get-card-class="getRowClass"
      @click="select"
      @contextmenu="showContextMenu"
      @dblclick="onSelect"
    >
      <slot
        slot="card"
        slot-scope="{row}"
        name="card"
        :row="row"
      />

      <next-page-button slot="append" />
    </u-card-view>

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
              icon="u-icon-edit"
              label="Edit"
              :disabled="!canEdit"
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
              icon="u-icon-copy"
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
              icon="u-icon-delete"
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
              icon="u-icon-link"
              label="link"
              :disabled="!hasSelectedRow"
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
              icon="u-icon-line-chart"
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
const { mapState, mapGetters, mapMutations, mapActions } = require('vuex')
const TypeProvider = require('../type-provider')

export default {
  name: 'UTableEntityRoot',

  components: {
    FilterSelector: require('./FilterSelector.vue').default,
    Pagination: require('./Pagination.vue').default,
    Sort: require('./Sort.vue').default,
    FilterList: require('./FilterList.vue').default,
    ToolbarDropdown: require('./ToolbarDropdown.vue').default,
    UCardView: require('../../controls/UCardView.vue').default,
    NextPageButton: require('./NextPageButton.vue').default
  },

  props: {
    /**
     * If set, table will have static height.
     * Table container will have own scroll and fixed header.
     */
    height: [Number, String],

    /**
     * If set, table will have maxHeight.
     * Table container will have own scroll and fixed header.
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
      'items',
      'loading',
      'withTotal',
      'sort',
      'pageIndex'
    ]),

    ...mapGetters([
      'canAddNew',
      'canEdit',
      'canDelete',
      'canAudit',
      'hasSelectedRow',
      'formCode',
      'columns',
      'cardColumns'
    ]),

    selectedColumnId: {
      get () {
        return this.$store.state.selectedColumnId
      },
      set (value) {
        this.$store.commit('SELECT_COLUMN', value)
      }
    },

    selectedRowId: {
      get () {
        return this.$store.state.selectedRowId
      },
      set (value) {
        this.$store.commit('SELECT_ROW', value)
      }
    },

    viewMode: {
      get () {
        return this.$store.state.viewMode
      },

      set (mode) {
        this.$store.commit('SET_VIEW_MODE', mode)
      }
    }
  },

  watch: {
    selectedRowId (id) {
      this.$emit('change-row', id)
    },

    pageIndex () {
      if (this.$refs.table) {
        this.$refs.table.$el.scrollTop = 0
      }
      if (this.$refs.cardView) {
        this.$refs.cardView.$el.scrollTop = 0
      }
    }
  },

  methods: {
    ...mapActions([
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
      this.select({ row, column })
      this.contextMenuRowId = row.ID
      this.$refs.contextMenu.show(event)
    },

    select ({ row, column }) {
      if (column !== undefined) {
        this.SELECT_COLUMN(column.id)
      }
      if (row !== undefined) {
        this.SELECT_ROW(row.ID)
      }
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

    move (direction) {
      switch (direction) {
        case 'up':
          if (this.selectedRowId === null) return
          this.SELECT_ROW(this.getPrevArrayValue(this.items, 'ID', this.selectedRowId))
          this.scrollIntoView()
          break

        case 'down':
          if (this.selectedRowId === null) return
          this.SELECT_ROW(this.getNextArrayValue(this.items, 'ID', this.selectedRowId))
          this.scrollIntoView()
          break

        case 'left':
          if (this.selectedColumnId === null) return
          if (this.viewMode === 'table') {
            this.SELECT_COLUMN(this.getPrevArrayValue(this.columns, 'id', this.selectedColumnId))
          }
          if (this.viewMode === 'card') {
            this.SELECT_ROW(this.getPrevArrayValue(this.items, 'ID', this.selectedRowId))
          }
          this.scrollIntoView()
          break

        case 'right':
          if (this.selectedColumnId === null) return
          if (this.viewMode === 'table') {
            this.SELECT_COLUMN(this.getNextArrayValue(this.columns, 'id', this.selectedColumnId))
          }
          if (this.viewMode === 'card') {
            this.SELECT_ROW(this.getNextArrayValue(this.items, 'ID', this.selectedRowId))
          }
          this.scrollIntoView()
          break
      }
    },

    getColumnClass (column) {
      if (column.id === this.selectedColumnId) {
        return 'selected'
      }
      return ''
    },
    getRowClass (row) {
      return row.ID === this.selectedRowId
        ? 'selected'
        : ''
    },

    async scrollIntoView () {
      await this.$nextTick()

      if (this.viewMode === 'table') {
        const table = this.$refs.table.$el
        const cell = table.querySelector('tr.selected td.selected')
        if (cell) {
          cell.scrollIntoView({
            block: 'nearest',
            inline: 'nearest'
          })
        }
      }

      if (this.viewMode === 'card') {
        const cardView = this.$refs.cardView.$el
        const card = cardView.querySelector('.u-card.selected')
        if (card) {
          card.scrollIntoView({
            block: 'nearest',
            inline: 'nearest'
          })
        }
      }
    },

    onSelect (ID, row) {
      if (this.onSelectRecord) {
        this.onSelectRecord({ ID, row, close: this.close })
      } else {
        this.editRecord(ID)
      }
    },

    getSortIconClass (columnId) {
      if (this.sort.column !== columnId) return ''

      if (this.sort.order === 'asc') return 'u-icon-sort-asc'
      if (this.sort.order === 'desc') return 'u-icon-sort-desc'
    },

    showSortDropdown (column) {
      this.SELECT_COLUMN(column.id)
      // setTimeout for prevent click outside
      setTimeout(this.$refs.sort.$refs.dropdown.toggleVisible, 0)
    }
  }
}
</script>

<style>
@media (min-height: 500px) {
  .u-table-entity .u-table {
    overflow: auto;
  }
}

.u-table-entity {
  --row-selected: hsl(var(--hs-primary), var(--l-background-default));
  --cell-selected: hsl(var(--hs-primary), var(--l-background-active));
  --row-selected-border: hsl(var(--hs-primary), var(--l-layout-border-default));

  display: flex;
  flex-direction: column;
  overflow: auto;
}

.u-table-entity .u-table {
  flex-grow: 1;
}

.u-table-entity__head {
  padding: 8px;
  padding-left: 0;
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  left: 0;
  flex-shrink: 0;
}

.u-table-entity__head .u-button {
  margin-left: 8px;
}

.u-table-entity-panel__table th > .cell {
  word-break: normal;
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

.u-table-entity__header-dropdown {
  align-self: center;
}

.u-table-entity__contextmenu-wrap {
  height: 0;
}

.u-table-entity .u-card {
  border: 2px solid transparent;
}

.u-table-entity .u-card.selected {
  background: hsl(var(--hs-primary), var(--l-background-default));
}

.u-fake-table {
  display: table;
  padding: 6px;
}

.u-fake-table__tbody {
  display: table-row-group;
}

.u-fake-table__tr {
  display: table-row;
}

.u-fake-table__td {
  display: table-cell;
  padding: 6px;
  vertical-align: middle;
}

.u-fake-table__label {
  color: hsl(var(--hs-text), var(--l-text-label))
}

.u-fake-table__label:after {
  content: ':';
}

.u-table-entity__filter-submit-container {
  text-align: right;
}
</style>