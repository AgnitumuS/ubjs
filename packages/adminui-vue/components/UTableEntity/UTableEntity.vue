<template>
  <u-table-entity-root
    :bordered="bordered"
    v-bind="$attrs"
    :with-pagination="withPagination"
    :view-mode.sync="viewMode"
    :enable-multi-select="enableMultiSelect"
    :multi-select-key-attr="multiSelectKeyAttr"
    :selected-rows="curSelected"
    :show-delete-multiple-btn="showDeleteMultipleBtn"
    v-on="tableListeners"
    @addSelected="handlerAddSelected"
    @removeSelected="handlerRemoveSelected"
    @deleteMultipleResult="deleteMultipleResult"
  >
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
  </u-table-entity-root>
</template>

<script>
const Vuex = require('vuex')
const { mapGetters, mapActions } = Vuex
const createStore = require('./store')
const UTableEntityRoot = require('./components/UTableEntityRoot.vue').default
const TypeProvider = require('./type-provider')
const selectionProps = require('../controls/mixins/selection/props')
const ColumnTemplateProvider = require('./column-template-provider')

export default {
  name: 'UTableEntity',
  components: { UTableEntityRoot },
  mixins: [selectionProps],
  props: {
    /**
     * Function which return UB.ClientRepository or UBQL object
     */
    repository: {
      type: [Function, Object],
      required: false,
      default: undefined
    },

    /**
     * Name of entity. If repository is set entityName will be ignored
     */
    entityName: {
      type: String,
      required: false,
      default () {
        return undefined
      }
    },

    /**
     * Array of columns settings where each item can be string or object.
     * For detail info about column object look JSDoc type {UTableColumn}
     */
    columns: {
      type: Array,
      required: false,
      default () {
        return undefined
      }
    },

    /**
     * Whether to use pagination for table
     */
    withPagination: {
      type: Boolean,
      required: false,
      default: true
    },

    /**
     * Page size for pagination. Default is `appConfig.storeDefaultPageSize` || 50
     */
    pageSize: {
      type: Number,
      default () {
        return this.$UB.connection.appConfig.storeDefaultPageSize || 50
      }
    },

    /**
     * Allows to hide some actions, even, if they user has ELS for related entity methods.
     * Actions shall be passed as array of strings, supported actions for this property:
     * `addNew`, `copy`, `newVersion`, `showVersions`, `edit`, `delete`, `audit`, `summary`, `export`,
     * `link`, `viewMode`.
     *
     * For compatibility with legacy AdminUI, the following alternative codes are supported:
     * `del` for `delete`,
     * `addNewByCurrent` for `copy`,
     * `itemLink` for `link`
     */
    hideActions: {
      type: Array,
      required: false,
      default () {
        return []
      }
    },

    /**
     * Overrides showDictionary action config.
     * Function is called (using await, so can be async) with 2 arguments: (cfg: current config, row: content of row to edit) can mutate cfg and return mutated config
     */
    buildCopyConfig: {
      type: Function,
      default: config => config
    },

    /**
     * Overrides edit action config.
     * Function is called (using await, so can be async) with 2 arguments: (cfg: current config, row: content of row to edit) can mutate cfg and return mutated config
     */
    buildEditConfig: {
      type: Function,
      default: config => config
    },

    /**
     * Overrides addNew action config.
     * Function accept one parameter cfg: Object - config for doCmd.showForm, can mutate it and return mutated config
     */
    buildAddNewConfig: {
      type: Function,
      default: config => config
    },

    /**
     * Callback which will be emitted before addNew
     */
    beforeAddNew: {
      type: Function,
      default: null
    },

    /**
     * Array of column settings. Same as "column" prop but for card view.
     */
    cardColumns: {
      type: Array,
      default: () => []
    },

    /**
     * Hook which called after store created, but data didn't start to load.
     */
    beforeInitialLoad: {
      type: Function,
      default: () => () => Promise.resolve()
    },

    /**
     * Whether is opened as modal to provide open of child commands as modal
     */
    isModal: Boolean,

    /**
     * Display a border around table and toolbar
     */
    bordered: {
      type: Boolean,
      default: true
    },
    /**
     * Displays the delete button on the toolbar. Automatically enabled on the function of deleting selected items
     */
    showDeleteMultipleBtn: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      curSelected: [],
    }
  },
  computed: {
    ...mapGetters(['schema']),

    getEntityName () {
      return this.entityName || this.getRepository().entityName
    },
    tableListeners () {
      const { selected, ...otherListeners } = this.$listeners
      return otherListeners
    },

    getColumns () {
      if (this.columns) {
        return this.columns.map(column => {
          if (typeof column === 'string') {
            return this.buildColumn(/** @type {UTableColumn} */ { id: column })
          }
          return this.buildColumn(column)
        })
      }

      return this.getRepository()
        .fieldList.filter(attrCode => {
          const attr = this.schema.getEntityAttribute(attrCode, 0)
          return attr && this.isAttributeViewableByDefault(attr)
        })
        .map(attrCode =>
          this.buildColumn(/** @type {UTableColumn} */ { id: attrCode })
        )
    },

    getCardColumns () {
      if (this.cardColumns.length > 0) {
        return this.cardColumns.map(column => {
          if (typeof column === 'string') {
            return this.buildColumn(/** @type {UTableColumn} */ { id: column })
          }
          return this.buildColumn(column)
        })
      }
      return this.getColumns
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
    entityName: 'loadData'
  },

  async created () {
    this.selectionCache = new Set(this.selectedRows);
    this.tableItems = [];
    const storeConfig = createStore(this)
    this.$store = new Vuex.Store(storeConfig)
    this.$watch('$store.state.items', this.handlerTableDataChange)
    await this.beforeInitialLoad(this)
    this.loadData()
  },

  mounted () {
    this.validateFieldList()
    this.$UB.connection.on(`${this.getEntityName}:changed`, this.updateData)
  },

  beforeDestroy () {
    this.$UB.connection.removeListener(
      `${this.getEntityName}:changed`,
      this.updateData
    )
    this.unsubscribeLookups()
  },

  methods: {
    ...mapActions(['loadData', 'unsubscribeLookups', 'updateData']),
    handlerAddSelected(addedArr){
      const { selectionCache, multiSelectKeyAttr } = this
      addedArr.forEach(item => {
        selectionCache.add(item[multiSelectKeyAttr])
      })
       this.emitSelectedEvent()
    },
    handlerRemoveSelected(removedArr){
      const { selectionCache, multiSelectKeyAttr } = this
      removedArr.forEach(item => {
        selectionCache.delete(item[multiSelectKeyAttr])
      })
      this.emitSelectedEvent()
    },
    emitSelectedEvent () {
      this.$emit('selected', [...this.selectionCache])
    },
    handlerTableDataChange (items) {
      this.tableItems = items
      this.setCurrentSelected()
    },
    setCurrentSelected () {
      this.curSelected.splice(0)
      const { selectionCache, multiSelectKeyAttr } = this
      this.tableItems.forEach(elem => {
        const id = elem[multiSelectKeyAttr]
        const inCache = selectionCache.has(id)
        if (inCache) this.curSelected.push(id)
      })
    },
    deleteMultipleResult (ev) {
      if (!ev) return
      const { success } = ev
      if (!success || success.length === 0) return
      success.forEach(code => this.selectionCache.delete(code))
      this.setCurrentSelected()
      this.emitSelectedEvent()
      this.deleteMultipleShowSuccessAlert(success)
      this.$store.dispatch('refresh')
    },
    deleteMultipleShowSuccessAlert (arr = []) {
      const { tableItems, multiSelectKeyAttr, getEntityName } = this
      const message = arr.reduce((acum, id) => {
        acum += `<li>${getDescription(id)}</li>`
        return acum
      }, '')
      const duration = arr.length > 7 ? arr.length * 1000 : 7 * 1000
      this.$notify.success({
        title: UB.i18n('recordDeletedSuccessfully'),
        message: `<ul class="multiple-delete--alert">${message}</ul>`,
        duration,
        dangerouslyUseHTMLString: true
      })
      function getDescription (code) {
        const item = tableItems.find(i => i[multiSelectKeyAttr] === code)
        const descriptionAttr = UB.connection.domain.get(getEntityName)
          .descriptionAttribute
        return item[descriptionAttr] || ''
      }
    },
    getRepository () {
      switch (typeof this.repository) {
        case 'function':
          return this.repository()
        case 'object':
          return this.$UB.Repository(this.repository)
        default: {
          // build repository based on columns (if available) or attributes with `defaultView: true`
          const repo = this.$UB.Repository(this.entityName)
          const viewableAttrs = []
          if (this.columns) {
            this.getColumns.forEach(c => {
              if (c.attribute !== undefined) viewableAttrs.push(c.id)
            })
          } else {
            this.$UB.connection.domain.get(this.entityName).eachAttribute(a => {
              if (this.isAttributeViewableByDefault(a)) {
                viewableAttrs.push(a.code)
              }
            })
          }
          if (!viewableAttrs.includes('ID')) repo.attrs('ID')
          repo.attrs(viewableAttrs)
          return repo
        }
      }
    },

    /**
     * Get default column settings by dataType and merge it with custom column settings
     *
     * @param {UTableColumn} column
     * @returns {UTableColumn}
     */
    buildColumn (column) {
      const attrInfo = this.$store.getters.schema.getEntityAttributeInfo(
        column.id,
        0
      )

      let attribute = column.attribute
      if (attribute === undefined && attrInfo) {
        attribute =
          attrInfo.parentAttribute &&
          attrInfo.parentAttribute.dataType === 'Json'
            ? attrInfo.parentAttribute // for JSON actual attribute is undefined
            : attrInfo.attribute
      }

      let label = column.label
      if (label === undefined || label === '') {
        // 3 level depth is enough here. in case `attr0.attr1.attr2.attr3` then mostly what developer already pass description
        if (
          attrInfo &&
          attrInfo.parentAttribute &&
          attrInfo.parentAttribute.dataType !== 'Json'
        ) {
          label = `${attrInfo.parentAttribute.caption} / ${attrInfo.attribute.caption}`
          // check 3 level depth
          const prevAttrInfo = this.$store.getters.schema.getEntityAttributeInfo(
            column.id,
            -1
          )
          if (prevAttrInfo.parentAttribute) {
            label = `${prevAttrInfo.parentAttribute.caption} / ${label}`
          }
        } else if (
          attrInfo &&
          attrInfo.attribute &&
          attrInfo.attribute.caption
        ) {
          label = attrInfo.attribute.caption
        } else {
          label = column.id
        }
      }

      const columnDefaults = ColumnTemplateProvider.getByColumnAttribute(attribute)
      const filters = {}

      if (column.filterable !== false) {
        const filterEntries = Object.entries(columnDefaults.filters || {})
          .concat(Object.entries(column.filters || {}))

        for (const [filterId, filterDef] of filterEntries) {
          filters[filterId] = Object.assign({}, filters[filterId], filterDef)
        }
      }

      /**
       * @type {UTableColumn}
       */
      const resultColumn = {
        label,
        attribute,
        ...columnDefaults.settings,
        ...column,
        filters
      }
      if (typeof resultColumn.format === 'string') {
        // eslint-disable-next-line no-new-func
        resultColumn.format = new Function(
          '{value, column, row}',
          resultColumn.format
        )
      }

      return resultColumn
    },

    /**
     * Each attribute (except custom) what used in columns definition should be added into repository `fieldList`
     */
    validateFieldList () {
      const repoFieldList = this.getRepository().fieldList
      const fieldsWithError = this.getColumns
        .filter(column => {
          return (
            column.toValidate !== false &&
            !repoFieldList.includes(column.id) && // is custom
            !this.$scopedSlots[column.id] // dont have slot
          )
        })
        .map(column => column.id)

      if (fieldsWithError.length > 0) {
        const errMsg = `Rendering slot is not defined for columns [${fieldsWithError.join(
          ', '
        )}]`
        throw new Error(errMsg)
      }
    },

    /**
     * Whenever attribute is viewable by default. Attributes what potentially can contains
     *   a huge text ('Json', 'Document' and 'Text' type) `are excluded
     * @param {UBEntityAttribute} attr
     * @return {boolean}
     */
    isAttributeViewableByDefault (attr) {
      return (
        attr.defaultView &&
        attr.dataType !== 'Json' &&
        attr.dataType !== 'Document' &&
        attr.dataType !== 'Text'
      )
    }
  }
}
</script>

<style>
.multiple-delete--alert {
  padding-left: 18px;
  max-height: 60vh;
  overflow: auto;
  padding-right: 8px;
  width: calc(100% + 17px);
}
.multiple-delete--alert li {
  margin-bottom: 8px;
}
.u-table__multiple td,
.u-table__multiple th:first-child {
  cursor: pointer;
}
.u-table__multiple td:first-child {
  text-align: center;
}

.u-table__multiple th:first-child {
  z-index: 2;
}

.u-table .selected-row td,
.u-card.u-card--is-selected {
  background: hsl(var(--hs-primary), var(--l-background-default));
}
</style>
