<template>
  <div
    v-loading="loading"
    :class="{
      'u-table-entity': true,
      'u-table-entity__bordered': bordered
    }"
    tabindex="1"
    @keydown.ctrl.delete.exact="canDelete && deleteRecord(selectedRowId)"
    @keydown.ctrl.e.prevent.exact="canEdit && editRecord(selectedRowId)"
    @keydown.ctrl.insert.exact="canAddNew && addNew()"
    @keydown.ctrl.r.prevent.exact="!loading && refresh()"
    @keydown.enter.exact="onSelect(selectedRowId)"
    @keydown.left.prevent.exact="move('left')"
    @keydown.right.prevent.exact="move('right')"
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

        <u-button
          :title="$ut('refresh')"
          appearance="inverse"
          icon="u-icon-refresh"
          color="control"
          :disabled="loading"
          @click="refresh"
        />

        <!-- @slot Replace add-new button in toolbar panel -->
        <slot
          :close="close"
          :store="$store"
          name="toolbarButtonAddNew"
        >
          <u-button
            v-if="showAddNew"
            :title="$ut('actionAdd')"
            appearance="inverse"
            :disabled="!canAddNew"
            icon="u-icon-add"
            color="control"
            @click="addNew"
          />
        </slot>

        <u-button
          v-if="showDeleteMultipleBtn"
          :title="$ut('delete')"
          appearance="inverse"
          icon="u-icon-delete"
          color="control"
          :disabled="loading || selectedOnPage.length === 0"
          @click="deleteRecord"
        />

        <!-- @slot Prepend new buttons to toolbar before filter -->
        <slot
          :close="close"
          :store="$store"
          name="toolbarAppend"
        />

        <filter-selector 
          v-if="showFilter"
          ref="filterSelector"
        />
        <sort
          ref="sort"
          :target-column="targetColumn"
          @close="onSortClose"
        />
        <pagination v-if="withPagination" />
        <div
          v-else
          style="margin-left: auto"
        />

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
                v-if="showAddNew"
                :close="close"
                :store="$store"
                name="toolbarDropdownAddNew"
              />
              <div v-else />
            </template>
            <!-- @slot Replace edit button in toolbar dropdown -->
            <template #edit>
              <slot
                v-if="showEdit"
                :close="close"
                :store="$store"
                name="toolbarDropdownEdit"
              />
              <div v-else />
            </template>
            <!-- @slot Replace copy button in toolbar dropdown -->
            <template #copy>
              <slot
                v-if="showCopy"
                :close="close"
                :store="$store"
                name="toolbarDropdownCopy"
              />
              <div v-else />
            </template>
            <!-- @slot Replace delete button in toolbar dropdown -->
            <template #delete>
              <slot
                v-if="showDelete"
                :close="close"
                :store="$store"
                name="toolbarDropdownDelete"
              />
              <div v-else />
            </template>
            <!-- @slot Replace audit button in toolbar dropdown -->
            <template #audit>
              <slot
                v-if="showAudit"
                :close="close"
                :store="$store"
                name="toolbarDropdownAudit"
              />
              <div v-else />
            </template>
            <!-- @slot Replace summary button in toolbar dropdown -->
            <template #summary>
              <slot
                v-if="showSummary"
                :close="close"
                :store="$store"
                name="toolbarDropdownSummary"
              />
              <div v-else />
            </template>
            <!-- @slot Replace data history button in toolbar dropdown -->
            <template #dataHistory>
              <slot
                v-if="showVersions"
                :close="close"
                :store="$store"
                name="toolbarDropdownDataHistory"
              />
              <div v-else />
            </template>
            <!-- @slot Replace exports button in toolbar dropdown -->
            <template #exports>
              <slot
                v-if="showExport"
                :close="close"
                :store="$store"
                name="toolbarDropdownExports"
              />
              <div v-else />
            </template>

            <!-- @slot Replace viewMode button in toolbar dropdown -->
            <template
              v-if="showViewMode"
              #viewMode
            >
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

    <filter-list @click-on-label="toggleVisibleFilterDropdown" />

    <div class="u-table-entity__body">
      <!-- @slot Add a sidebar to the left side of the table or card-view -->
      <slot name="sidebar" />

      <u-table
        v-if="viewMode === 'table'"
        ref="table"
        v-model="selectedOnPage"
        class="u-table-entity__body__content"
        :columns="columns"
        :fixed-column-id="fixedColumnId"
        :pre-multi-selection-column-id="preMultiSelectionColumnId"
        :get-column-class="getColumnClass"
        :height="height"
        :items="items"
        :max-height="maxHeight"
        tabindex="1"
        :before-add-selection="beforeAddSelection"
        :before-remove-selection="beforeRemoveSelection"
        :enable-multi-select="enableMultiSelect"
        :multi-select-key-attr="multiSelectKeyAttr"
        @selected="$emit('selected', $event)"
        @add-selected="$emit('add-selected', $event)"
        @remove-selected="$emit('remove-selected', $event)"
        @click-head-cell="showSortDropdown"
        @click-cell="select"
        @contextmenu="showContextMenu"
        @dblclick-row="onSelect($event.row.ID, $event.row)"
        @change-active-row="activeRowChangeHandler"
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
              :key="column.id"
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

        <template #lastTableRow>
          <!-- @slot display specific content in the last row of the table -->
          <slot name="lastTableRow" />
        </template>

        <template #appendTable>
          <next-page-button v-if="withPagination" />

          <!-- @slot add some content at the end of the table after the pagination button -->
          <slot name="appendTable" />
        </template>
      </u-table>

      <u-card-view
        v-if="viewMode === 'card'"
        ref="cardView"
        v-model="selectedOnPage"
        class="u-table-entity__body__content"
        :columns="cardColumns"
        :items="items"
        :get-card-class="getRowClass"
        :before-add-selection="beforeAddSelection"
        :before-remove-selection="beforeRemoveSelection"
        :enable-multi-select="enableMultiSelect"
        :multi-select-key-attr="multiSelectKeyAttr"
        @selected="$emit('selected', $event)"
        @add-selected="$emit('add-selected', $event)"
        @remove-selected="$emit('remove-selected', $event)"
        @click="select"
        @contextmenu="showContextMenu"
        @dblclick="onSelect($event.row.ID, $event.row)"
        @change-active-row="activeRowChangeHandler"
      >
        <slot
          slot="card"
          slot-scope="{ row }"
          name="card"
          :row="row"
        />
        <template
          v-for="slot in Object.keys($scopedSlots)"
          :slot="slot"
          slot-scope="scope"
        >
          <slot
            :name="slot"
            v-bind="scope"
          />
        </template>

        <template #append>
          <next-page-button v-if="withPagination" />

          <!-- @slot add some content at the end of the card-view after the pagination button -->
          <slot name="appendTable" />
        </template>
      </u-card-view>
    </div>

    <u-dropdown
      ref="contextMenu"
      class="u-table-entity__contextmenu-wrap"
      @close='closeDropdownHandler'
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
            v-if="showEdit && showOneItemActions"
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
            v-if="showCopy && showOneItemActions"
            :close="close"
            :row-id="contextMenuRowId"
            :store="$store"
            name="contextMenuCopy"
          >
            <u-dropdown-item
              :disabled="!canCopy"
              icon="u-icon-copy"
              label="Copy"
              @click="copyRecord(contextMenuRowId)"
            />
          </slot>

          <!-- @slot Replace action "delete" in context menu -->
          <slot
            v-if="showDelete"
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
            v-if="showCopyLink && showOneItemActions"
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
            v-if="showAudit && showOneItemActions"
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

          <slot
            :close="close"
            :row-id="contextMenuRowId"
            :store="$store"
            name="contextMenuDataHistory"
          >
            <template v-if="hasDataHistoryMixin">
              <u-dropdown-item divider />

              <u-dropdown-item
                v-if="showCreateNewVersion"
                icon="u-icon-file-add"
                label="novajaVersija"
                :disabled="!canCreateNewVersion"
                @click="createNewVersion(selectedRowId)"
              />

              <u-dropdown-item
                icon="u-icon-file-preview"
                label="ChangesHistory"
                @click="showRecordHistory(selectedRowId)"
              />
            </template>
          </slot>

          <!-- @slot Replace "detail records list" in context menu -->
          <slot
            v-if="showOneItemActions"
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
const selectionProps = require('../../controls/mixins/selection/props')
const ColumnTemplateProvider = require('../column-template-provider')

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

  mixins: [selectionProps],

  inject: {
    close: {
      default: () => () => console.warn('Injection "close" is not provided')
    }
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
     * Whether to use pagination for table
     */
    withPagination: {
      type: Boolean,
      required: false,
      default: true
    },

    /**
     * Display a border around table and toolbar
     */
    bordered: {
      type: Boolean,
      default: true
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
     * Overrides the record selection event. That is, double click or enter
     * @type {function({ID: Number, row: Object, close: function})}
     */
    onSelectRecord: Function,
    /**
     * Show "delete multiple" button if multi-select is enabled
     * @type {boolean}
     */
    showDeleteMultipleBtn: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      targetColumn: null,
      contextMenuRowId: null,
      cacheActiveElement: null
    }
  },

  computed: {
    ...mapState(['items', 'loading', 'withTotal', 'sort', 'pageIndex', 'showOneItemActions']),
    ...mapGetters([
      'showAddNew',
      'canAddNew',
      'showCopy',
      'canCopy',
      'showEdit',
      'canEdit',
      'showDelete',
      'canDelete',
      'showAudit',
      'canAudit',
      'hasSelectedRow',
      'formCode',
      'columns',
      'cardColumns',
      'showCreateNewVersion',
      'showVersions',
      'showCopyLink',
      'showViewMode',
      'canCreateNewVersion',
      'hasDataHistoryMixin',
      'showSummary',
      'showExport',
      'showFilter'
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
    },
    selectedOnPage: {
      get () {
        return this.$store.state.selectedOnPage
      },
      set (newValue) {
        this.$store.dispatch('setSelectedOnPage', newValue)
      }
    }
  },

  watch: {
    selectedRowId (id) {
      /** fires when user select row (in single-row selection mode)
       * @param {number} ID
       */
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
      'audit',
      'createNewVersion',
      'showRecordHistory'
    ]),

    ...mapMutations(['SELECT_COLUMN', 'SELECT_ROW']),

    getCellTemplate (column) {
      if (typeof column.template === 'function') {
        return column.template()
      }
      return ColumnTemplateProvider.getByColumnAttribute(column.attribute)
        .template
    },

    showContextMenu ({ event, row, column }) {
      this.select({ row, column })
      this.contextMenuRowId = row.ID
      this.cacheActiveElement = document.activeElement
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
      const isLast = index === array.length - 1
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
          this.SELECT_ROW(
            this.getPrevArrayValue(this.items, 'ID', this.selectedRowId)
          )
          this.scrollIntoView()
          break

        case 'down':
          if (this.selectedRowId === null) return
          this.SELECT_ROW(
            this.getNextArrayValue(this.items, 'ID', this.selectedRowId)
          )
          this.scrollIntoView()
          break

        case 'left':
          if (this.selectedColumnId === null) return
          if (this.viewMode === 'table') {
            this.SELECT_COLUMN(
              this.getPrevArrayValue(this.columns, 'id', this.selectedColumnId)
            )
          }
          if (this.viewMode === 'card') {
            this.SELECT_ROW(
              this.getPrevArrayValue(this.items, 'ID', this.selectedRowId)
            )
          }
          this.scrollIntoView()
          break

        case 'right':
          if (this.selectedColumnId === null) return
          if (this.viewMode === 'table') {
            this.SELECT_COLUMN(
              this.getNextArrayValue(this.columns, 'id', this.selectedColumnId)
            )
          }
          if (this.viewMode === 'card') {
            this.SELECT_ROW(
              this.getNextArrayValue(this.items, 'ID', this.selectedRowId)
            )
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
      return row.ID === this.selectedRowId ? 'selected' : ''
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

    showSortDropdown (column, target) {
      if (column.sortable === false) {
        return
      }

      this.SELECT_COLUMN(column.id)

      if (this.$refs.sort && this.$refs.sort.$refs.dropdown) {
        // setTimeout for prevent click outside
        setTimeout(() => {
          this.targetColumn = target
          this.$refs.sort.$refs.dropdown.toggleVisible()
        }, 0)
      }
    },

    onSortClose () {
      this.targetColumn = null
    },

    closeDropdownHandler () {
      if (!this.cacheActiveElement) return
      this.cacheActiveElement.focus()
    },

    activeRowChangeHandler ({ index }) {
      const id = this.items[index][this.multiSelectKeyAttr]
      this.SELECT_ROW(id)
    },
    toggleVisibleFilterDropdown () {
      const { filterSelector } = this.$refs
      if (!filterSelector) return
      const target = filterSelector.$el.querySelector('.u-dropdown__reference')
      if (!target) return
      const event = new MouseEvent('click')
      target.dispatchEvent(event)
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
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.u-table-entity__bordered {
  border: 1px solid hsl(var(--hs-border), var(--l-layout-border-default));
  border-radius: var(--border-radius);
}

.u-table-entity__bordered tr:last-child td {
  border-bottom: none;
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
  overflow: auto;
}

.u-table-entity__head .u-button {
  margin-left: 8px;
}

.u-table-entity-panel__table th > .cell {
  word-break: normal;
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
  background: hsl(var(--hs-primary), var(--l-background-active));
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
  color: hsl(var(--hs-text), var(--l-text-label));
}

.u-fake-table__label:after {
  content: ':';
}

.u-table-entity__filter-submit-container {
  text-align: right;
}

.u-table-entity__body {
  display: flex;
  overflow: auto;
}

.u-table-entity__body__content {
  flex-basis: 100%;
}
</style>
