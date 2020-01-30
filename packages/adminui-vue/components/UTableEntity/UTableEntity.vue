<template>
  <root
    :on-select-record="onSelectRecord"
    :fixed-column-id="fixedColumnId"
    :height="height"
    :max-height="maxHeight"
  />
</template>

<script>
const Vuex = require('vuex')
const { mapActions } = Vuex
const props = require('./props')
const createStore = require('./store')
const RootComponent = require('./components/Root.vue').default
const Root = {
  // hack to pass all slots and props to child component
  render (h) {
    return h(RootComponent, {
      props: this.$parent.$props,
      scopedSlots: this.$parent.$scopedSlots
    })
  }
}
const types = require('./type-provider')

export default {
  name: 'UTableEntity',

  components: { Root },

  props: {
    ...props,

    /**
     * Function which return UB.ClientRepository or UBQL object
     */
    repository: [Function, Object],

    /**
     * Name of entity. If repository is set entityName will be ignored
     */
    entityName: String,

    /**
     * Array of columns settings each item can be string or object.
     * For detail info about column object look JSDoc type {UTableColumn}
     */
    columns: Array,

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
     * Callback which will be emitted before addNew
     */
    beforeAddNew: {
      type: Function,
      default: null
    }
  },

  computed: {
    getEntityName () {
      return this.entityName || this.getRepository().entityName
    },

    getColumns () {
      if (this.columns) {
        return this.columns.map(column => {
          if (typeof column === 'string') {
            return this.buildColumn(column)
          } else {
            return {
              ...this.buildColumn(column.id),
              ...column
            }
          }
        })
      } else {
        return this.$UB.connection.domain.get(this.getEntityName)
          .filterAttribute(a => a.defaultView)
          .map(({ code }) => this.buildColumn(code))
      }
    }
  },

  watch: {
    entityName: 'fetchItems'
  },

  created () {
    const storeConfig = createStore(this)
    this.$store = new Vuex.Store(storeConfig)
    this.fetchItems()
  },

  mounted () {
    this.validateFieldList()
    this.$UB.connection.on(`${this.getEntityName}:changed`, this.refresh)
  },

  beforeDestroy () {
    this.$UB.connection.removeListener(`${this.getEntityName}:changed`, this.refresh)
  },

  methods: {
    ...mapActions(['fetchItems', 'refresh']),

    getRepository () {
      switch (typeof this.repository) {
        case 'function':
          return this.repository()
        case 'object':
          return this.$UB.Repository(this.repository)
        default:
          return this.$UB.Repository(this.entityName)
            .attrs(
              this.$UB.connection.domain.get(this.entityName).getAttributeNames()
            )
      }
    },

    /**
     * Build column generate label and default settings for current attribute dataType
     *
     * @param {string} columnId
     * @returns {UTableColumn}
     */
    buildColumn (columnId) {
      const attrInfo = this.$store.getters.schema.getEntityAttributeInfo(columnId, 0)
      const last = attrInfo && attrInfo.attribute
      const penult = attrInfo && (attrInfo.parentAttribute || last)
      const dataType = last && last.dataType
      const columnDef = types.get(dataType)
      let label
      if (penult) {
        label = this.$ut(`${penult.entity.code}.${penult.code}`) || columnId
      } else {
        label = columnId
      }

      return {
        id: columnId,
        label,
        attribute: last,
        ...columnDef
      }
    },

    validateFieldList () {
      const fieldsWithError = this.getColumns
        .filter(column => !this.getRepository().fieldList.includes(column.id)) // is custom
        .filter(column => !this.$scopedSlots[column.id]) // dont have slot
        .map(column => column.id)

      if (fieldsWithError.length > 0) {
        const errMsg = `Columns [${fieldsWithError.join(', ')}] did not present in fieldList and did not have slot for render`
        throw new Error(errMsg)
      }
    }
  }
}
</script>
