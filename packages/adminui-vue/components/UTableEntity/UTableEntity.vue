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
const { mapGetters, mapActions } = Vuex
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
     * Replace result keys with fieldlist
     * Sometimes, server returns result with altered fieldList, like entities with Entity-Attribute-Value mixin
     * (see `@unitybase/forms`).  This property tells UTableEntity control to stick with original fieldList from request,
     * rather than using fieldList from response.
     */
    useRequestFieldList: {
      type: Boolean,
      default: false
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
    ...mapGetters(['schema']),

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
              ...column,
              ...(
                typeof column.format === 'string'
                  ? { format: new Function('{value, column, row}', column.format) }
                  : {}
              )
            }
          }
        })
      } else {
        return this.getRepository().fieldList
          .filter(attrCode => {
            const attr = this.schema.getEntityAttribute(attrCode, 0)
            return attr.defaultView
          })
          .map(attrCode => this.buildColumn(attrCode))
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
          const repo = this.$UB.Repository(this.entityName)
          if (this.columns) {
            repo.attrs(
              this.getColumns
                .filter(c => c.attribute !== undefined)
                .map(c => c.id)
            )
          } else {
            repo.attrs(
              this.$UB.connection.domain.get(this.entityName).getAttributeNames()
            )
          }
          return repo
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
        attribute: penult.dataType === 'Json' ? penult : last,
        ...columnDef
      }
    },

    validateFieldList () {
      const fieldsWithError = this.getColumns
        .filter(column => !this.getRepository().fieldList.includes(column.id)) // is custom
        .filter(column => !this.$scopedSlots[column.id]) // dont have slot
        .map(column => column.id)

      if (fieldsWithError.length > 0) {
        const errMsg = `Columns [${fieldsWithError.join(', ')}] did not have slot for render`
        throw new Error(errMsg)
      }
    }
  }
}
</script>

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
