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
      :columns="columnsFormatted"
      :items="items"
      :get-column-class="getColumnClass"
      :get-row-class="getRowClass"
      :height="height"
      :max-height="maxHeight"
      :fixed-column-id="fixedColumnId"
      @dblclick-row="onSelect($event.row.ID)"
      @click-cell="selectCell"
      @sort="updateSort"
      @contextmenu="showContextMenu"
    >
      <template
        v-for="col in columnsFormatted"
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
const createStore = require('../store')
const Vuex = require('vuex')
const { mapState, mapGetters, mapMutations, mapActions } = Vuex
const { buildProps } = require('../helpers.js')
const FilterList = require('./FilterList.vue').default
const ToolbarDropdown = require('./ToolbarDropdown.vue').default
const { formatValueMixin } = require('../helpers')
/**
 * Replaced from function to global scope in case not to create a regular expression every function call.
 * Creating of regular expression is slow operation
 */
const regExpLetterOrNumber = /[A-Za-zА-Яа-я0-9]/

/**
 * Props repository, entityName, columns, pageSize have an unusual way of using.
 * 'store' option in this component watch this props and build same default values which is set in default(){} each of this prop.
 * It need for pass propsData to store.
 * Child components can get access for this props from store getters
 */
export default {
  name: 'UTableEntity',

  components: {
    ContextMenu,
    FilterContainer,
    Pagination,
    FilterList,
    ToolbarDropdown
  },

  mixins: [formatValueMixin],

  inject: {
    close: {
      default: () => () => console.warn('Injection close didn\'t provided')
    }
  },

  props: {
    /**
     * Function which return UB.ClientRepository
     */
    repository: {
      type: Function,
      default () {
        return this.$UB.Repository(this.entityName)
          .attrs(
            this.$UB.connection.domain.get(this.entityName).getAttributeNames()
          )
      }
    },

    /**
     * Name of entity. If repository is set entityName will be ignored
     */
    entityName: {
      type: String,
      default () {
        return this.repository().entityName
      }
    },

    /**
     * Array of columns settings each item can be string or object.
     * For detail info about column object look JSDoc type {UTableColumn}
     */
    columns: {
      type: Array,
      default () {
        return this.$UB.connection.domain.get(this.entityName)
          .filterAttribute(a => a.defaultView)
          .map(({ code }) => code)
      }
    },

    /**
     * Page size for pagination
     */
    pageSize: {
      type: Number,
      default () {
        return this.$UB.connection.appConfig.storeDefaultPageSize
      }
    },

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
     * Date format for cell's with dataType 'Date'
     */
    dateFormat: {
      type: String,
      default: 'll'
    },

    /**
     * Date format for cell's with dataType 'DateTime'
     */
    dateTimeFormat: {
      type: String,
      default: 'lll'
    },

    /**
     * Overrides showDictionary action config.
     * Function accepts current config and must return new config
     */
    buildCopyConfig: {
      type: Function,
      default: config => config
    },
    /**
     * Overrides edit action config.
     * Function accepts current config and must return new config
     */
    buildEditConfig: {
      type: Function,
      default: config => config
    },
    /**
     * Overrides addNew action config.
     * Function accepts current config and must return new config
     */
    buildAddNewConfig: {
      type: Function,
      default: config => config
    },
    /**
     * Overrides the record selection event. That is, double click or enter
     */
    onSelectRecord: Function
  },

  /**
   * Create vuex store
    */
  store () {
    const props = buildProps(this.propsData)
    const storeConfig = createStore(props)
    return new Vuex.Store(storeConfig)
  },

  created () {
    this.fetchItems()
  },

  computed: {
    ...mapState([
      'selectedRowId',
      'selectedColumnId',
      'items',
      'loading',
      'withTotal'
    ]),

    ...mapGetters(['canAddNew', 'formCode']),

    columnsFormatted () {
      return this.$store.getters.columns
    },

    selectedRowId: {
      get () {
        return this.$store.state.selectedRowId
      },
      set (value) {
        this.$store.commit('SELECT_ROW', value)
      }
    }
  },

  mounted () {
    this.validateFieldList()
    this.$UB.connection.on(`${this.entityName}:changed`, this.refresh)
  },

  beforeDestroy () {
    this.$UB.connection.removeListener(`${this.entityName}:changed`, this.refresh)
  },

  methods: {
    ...mapActions([
      'fetchItems',
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
    validateFieldList () {
      const fieldsWithError = this.columnsFormatted
        .filter(column => !this.repository().fieldList.includes(column.id)) // is custom
        .filter(column => !this.$scopedSlots[column.id]) // dont have slot
        .map(column => column.id)

      if (fieldsWithError.length > 0) {
        const errMsg = `Columns [${fieldsWithError.join(', ')}] did not present in fieldList and did not have slot for render`
        throw new Error(errMsg)
      }
    },

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
      this.SELECT_COLUMN(this.getPrevArrayValue(this.columnsFormatted, 'id', this.selectedColumnId))
      this.scrollIntoView()
    },
    moveRight () {
      this.SELECT_COLUMN(this.getNextArrayValue(this.columnsFormatted, 'id', this.selectedColumnId))
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
      const cell = table.querySelector(`.u-table-entity__selected__row .u-table-entity__selected__column`)
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

    onSelect (ID) {
      if (this.onSelectRecord) {
        this.onSelectRecord({ ID, close: this.close })
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

<docs>
Entity attributes with dataType `Text`, `BLOB`, `TimeLog` did not have default render component,
If you need to render this dataTypes render it by named column slots.
You need to decide to display this column type with great caution because this column can creates large server requests.

One of these options is required:
- `entity-name`
- `repository`

### Use as `entity-name`

```vue
<template>
  <u-table-entity entity-name="uba_user"/>
</template>
```

### Use as `repository`
Need to set function which returns UB Repository

```vue
<template>
  <u-table-entity :repository="repository"/>
</template>

<script>
  export default {
    methods: {
      repository () {
        return this.$UB.Repository('uba_user')
          .attrs('ID', 'login', 'name')
      }
    }
  }
</script>
```

### Columns
Columns array can contains strings or objects

```vue
<template>
  <u-table-entity
    entity-name="uba_user"
    :columns="columns"
  />
</template>

<script>
  export default {
    data () {
      return {
        columns: [
          'phone', // default column from entity
          'login', // default column from entity
          {
            id: 'name', // default column from but overrides settings
            label: 'User name',
            width: 250,
            align: 'center'
          }
        ]
      }
    }
  }
</script>
```

### Slots
You can override values as named slots.
In this case another columns will be shows as usual.
Slot scope will pass `value`, `row`, and `column`

```vue
<template>
  <u-table-entity
    entity-name="uba_user"
    :columns="columns"
  >
    <template #age="{row}">
      {{ row.login }}
      {{ row.age >= 18 ? 'is adult' : 'is kid'}}
    </template>

    <template #disabled="{value}">
      {{ value ? 'user is disabled' : 'user is enabled'}}
    </template>
  </u-table-entity>
</template>

<script>
  export default {
    data () {
      return {
        columns: [
          'phone',
          'name',
          'age',
          'disabled'
        ]
      }
    }
  }
</script>
```

### Custom columns
Custom column always required to have slot, because entity dont have data for this column

```vue
<template>
  <u-table-entity
    entity-name="uba_user"
    :columns="columns"
  >
    <template #customCol="{row}">
      {{ row.age >= 18 ? 'is adult' : 'is kid'}}
    </template>

    <template #customCol2="{row}">
      {{ row.disabled ? 'user is disabled' : 'user is enabled'}}
    </template>
  </u-table-entity>
</template>

<script>
  export default {
    data () {
      return {
        columns: [
          'phone',
          'login',
          'name',
          'customCol',
          {
            id: 'customCol2',
            label: 'Custom Col',
            width: 200,
            align: 'right'
          },
          'disabled'
        ]
      }
    }
  }
</script>
```

### Actions overrides
```vue
<template>
  <u-table-entity
    entity-name="tst_dictionary"
    :build-edit-config="actionEditOverride"
  />
</template>
<script>
  export default {
    data () {
      return {
        value: 1
      }
    },

    methods: {
      actionEditOverride (cfg) {
        return {
          ...cfg,
          isModal: false,
          docID: 12345
        }
      }
    }
  }
</script>
```
</docs>
