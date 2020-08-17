<template>
  <root
    v-bind="$attrs"
    v-on="$listeners"
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
  </root>
</template>

<script>
const Vuex = require('vuex')
const { mapGetters, mapActions } = Vuex
const createStore = require('./store')
const Root = require('./components/Root.vue').default
const TypeProvider = require('./type-provider')

export default {
  name: 'UTableEntity',

  components: { Root },

  props: {
    /**
     * Function which return UB.ClientRepository or UBQL object
     */
    repository: [Function, Object],

    /**
     * Name of entity. If repository is set entityName will be ignored
     */
    entityName: String,

    /**
     * Array of columns settings where each item can be string or object.
     * For detail info about column object look JSDoc type {UTableColumn}
     */
    columns: Array,

    /**
     * Page size for pagination
     */
    pageSize: {
      type: Number,
      default () {
        return this.$UB.connection.appConfig.storeDefaultPageSize || 50
      }
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
     * Callback which will be emitted before addNew
     */
    beforeAddNew: {
      type: Function,
      default: null
    },

    /**
     * If passed will store applied filters in localStorage
     */
    shortcutCode: [String, undefined]
  },

  data () {
    return {
      unwatchFilters: () => {} // no-op. in case passed shortcutCode will replaced by filters unwatch function
    }
  },

  computed: {
    ...mapGetters(['schema']),

    getEntityName () {
      return this.entityName || this.getRepository().entityName
    },

    getColumns () {
      if (this.columns) {
        return this.columns.map(column => {
          if (typeof column === 'string') {
            return this.buildColumn(/** @type UTableColumn */{ id: column })
          } else {
            return this.buildColumn(column)
          }
        })
      } else {
        return this.getRepository().fieldList
          .filter(attrCode => {
            const attr = this.schema.getEntityAttribute(attrCode, 0)
            return attr.defaultView &&
              (attr.dataType !== 'Json') &&
              (attr.dataType !== 'Document')
          })
          .map(attrCode => this.buildColumn(/** @type UTableColumn */{ id: attrCode }))
      }
    },

    filtersLocalStorageMask () {
      return `UTableEntity:filters:${this.shortcutCode}`
    }
  },

  watch: {
    entityName: 'loadData'
  },

  created () {
    const storeConfig = createStore(this)
    this.$store = new Vuex.Store(storeConfig)
    if (this.shortcutCode !== undefined) {
      this.applySavedFilters()
      this.unwatchFilters = this.watchFilters()
    }
    this.loadData()
  },

  mounted () {
    this.validateFieldList()
    this.$UB.connection.on(`${this.getEntityName}:changed`, this.updateData)
  },

  beforeDestroy () {
    this.$UB.connection.removeListener(`${this.getEntityName}:changed`, this.updateData)
    this.unsubscribeLookups()
    this.unwatchFilters()
  },

  methods: {
    ...mapActions([
      'loadData',
      'unsubscribeLookups',
      'updateData'
    ]),

    getRepository () {
      switch (typeof this.repository) {
        case 'function':
          return this.repository()
        case 'object':
          return this.$UB.Repository(this.repository)
        default: { // build repository based on columns (if available) or attributes with `defaultView: true`
          const repo = this.$UB.Repository(this.entityName)
          const viewableAttrs = this.columns
            ? this.getColumns.filter(c => c.attribute !== undefined).map(c => c.id)
            : this.$UB.connection.domain.get(this.entityName).getAttributeNames({ defaultView: true })
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
      const attrInfo = this.$store.getters.schema.getEntityAttributeInfo(column.id, 0)

      let attribute = column.attribute
      if (attribute === undefined && attrInfo) {
        attribute = (attrInfo.parentAttribute && attrInfo.parentAttribute.dataType === 'Json')
          ? attrInfo.parentAttribute // for JSON actual attribute is undefined
          : attrInfo.attribute
      }

      let label = column.label
      if ((label === undefined) || (label === '')) {
        // 3 level depth is enough here. in case `attr0.attr1.attr2.attr3` then mostly what developer already pass description
        if (attrInfo && attrInfo.parentAttribute && attrInfo.parentAttribute.dataType !== 'Json') {
          label = `${attrInfo.parentAttribute.caption} / ${attrInfo.attribute.caption}`
          // check 3 level depth
          const prevAttrInfo = this.$store.getters.schema.getEntityAttributeInfo(column.id, -1)
          if (prevAttrInfo.parentAttribute) label = `${prevAttrInfo.parentAttribute.caption} / ${label}`
        } else if (attrInfo && attrInfo.attribute) {
          label = attrInfo.attribute.caption
        } else {
          label = column.id
        }
      }

      const typeDefaults = TypeProvider.get(attribute && attribute.dataType)
      const filters = {}
      const filterEntries = Object.entries(typeDefaults.filters || {})
        .concat(Object.entries(column.filters || {}))

      for (const [filterId, filterDef] of filterEntries) {
        filters[filterId] = Object.assign({}, filters[filterId], filterDef)
      }

      /**
       * @type {UTableColumn}
       */
      const resultColumn = {
        label,
        attribute,
        ...typeDefaults.definition,
        ...column,
        filters
      }
      if (typeof resultColumn.format === 'string') {
        resultColumn.format = new Function('{value, column, row}', resultColumn.format)
      }

      return resultColumn
    },

    /**
     * In a case when you create component by repository prop
     * and forget to set attribute in fieldList but this attribute is in columns
     */
    validateFieldList () {
      const fieldsWithError = this.getColumns
        .filter(column => !this.getRepository().fieldList.includes(column.id)) // is custom
        .filter(column => !this.$scopedSlots[column.id]) // dont have slot
        .map(column => column.id)

      if (fieldsWithError.length > 0) {
        const errMsg = `Columns [${fieldsWithError.join(', ')}] did not have slot for render`
        throw new Error(errMsg)
      }
    },

    /**
     * Apply filters in case local storage has value for current shortcut
     */
    applySavedFilters () {
      const filtersStr = window.localStorage.getItem(this.filtersLocalStorageMask)
      if (filtersStr) {
        const filters = JSON.parse(filtersStr)
        for (const filter of filters) {
          this.$store.commit('APPLY_FILTER', filter)
        }
      }
    },

    /**
     * Watch filters and save it into local storage
     * @returns {function(): void} Unwatch store
     */
    watchFilters () {
      return this.$store.watch(
        state => state.filters,
        value => {
          window.localStorage.setItem(this.filtersLocalStorageMask, JSON.stringify(value))
        }
      )
    }
  }
}
</script>
