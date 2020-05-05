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
            return this.buildColumn({ id: column })
          } else {
            return this.buildColumn(column)
          }
        })
      } else {
        return this.getRepository().fieldList
          .filter(attrCode => {
            const attr = this.schema.getEntityAttribute(attrCode, 0)
            return attr.defaultView &&
              attr.dataType !== 'Json' &&
              attr.dataType !== 'Document'
          })
          .map(attrCode => this.buildColumn({ id: attrCode }))
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
        default: {
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
      }
    },

    /**
     * Get default column settings by dataType and merge it with custom column settings
     *
     * @param {UTableColumn} column
     * @returns {UTableColumn}
     */
    buildColumn (column) {
      const attribute = this.buildColumnAttribute(column)
      const label = this.buildColumnLabel(column)
      const typeDefaults = TypeProvider.get(attribute.dataType)
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
      console.log(resultColumn)
      if (typeof resultColumn.format === 'string') {
        resultColumn.format = new Function('{value, column, row}', resultColumn.format)
      }

      return resultColumn
    },

    /**
     * @param {UTableColumn} column
     * @returns {string} Column label
     */
    buildColumnLabel (column) {
      if (column.label !== undefined && column.label !== '') {
        return column.label
      }

      const attrInfo = this.$store.getters.schema.getEntityAttributeInfo(column.id, 0)
      if (attrInfo) {
        const labelAttr = attrInfo.parentAttribute || attrInfo.attribute
        return this.$ut(`${labelAttr.entity.code}.${labelAttr.code}`)
      } else {
        return column.id
      }
    },

    /**
     * @param {UTableColumn} column
     * @returns {object|UBEntityAttribute|undefined}
     */
    buildColumnAttribute (column) {
      if (column.attribute !== undefined) {
        return column.attribute
      }

      const attrInfo = this.$store.getters.schema.getEntityAttributeInfo(column.id, 0)
      if (attrInfo) {
        if (attrInfo.parentAttribute && attrInfo.parentAttribute.dataType === 'Json') {
          return attrInfo.parentAttribute
        } else {
          return attrInfo.attribute
        }
      }
    },

    /**
     * In a case when you create component by repository prop
     * and forgot to set attribute in fieldList but this attribute includes in columns
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

  ### Custom filter templates

  By default most UBDataTypes has filter templates and any filter can be replaced by custom.
  In each column filter label or filter template can be replaced separately.
  This dataTypes has next filters:
  - String
    - equal
    - contains
    - startWith
    - inNull
  - Boolean
    - isTrue
    - isFalse
    - isNull
  - Date, DateTime
    - range
    - fromDate
    - onDate
    - toDate
    - isNull
  - Entity
    - equal
    - contains
    - isNull
  - Enum
    - equal
    - contains
    - isNull
  - ID
    - equal
    - contains
  - Many
    - contains
    - isNull
  - BigInt, Currency, Float, Int
    - equal
    - more
    - less
    - range
    - isNull

  Json, Document, Text, BLOB, TimeLog has no filters

  `label` sets label for option in select with available filters for current column.
  If unset label will be equal filter id.
  `template` param must be `Vue.Component` or object with `render` function.
  To apply filter from custom component emit event 'seach'
  with object which has `description` and `whereList`.
  `description` - is a text for tag in list of applied filters.
  `whereList` - same as ubql whereList but without param `expression` it will be computed automatically.
  Filter application example:
  ```vue
  <template>
    <form @submit.prevent="$emit('search', {
      description: 'Filter query: ' + value,
      whereList: [{ condition: 'equal', value }]
    })">
      <input type="text" v-model="value">
      <button type="submit">submit</button>
    </form>
  </template>
  ```

  ### Custom filter example

  ```vue
  <template>
    <u-table-entity
      entity-name="tst_dictionary"
      :columns="columns"
    />
  </template>
  <script>
    export default {
      data () {
        return {
          columns: [
            'ID',
            'code',
            {
              id: 'caption',
              filters: {
                // example replace default filters
                equal: {
                  label: 'Custom equal label', // Replace label
                  template: {render(h) { return h('div', 'example') }} // Replace filter template
                },
                contains: {
                  label: 'Custom contains label' // Can be replaced only label
                },

                // adds custom filter
                myCustomFilter: {
                  /**
                   * In current example default value is "myCustomFilter"
                   * if unset will be equal filter id by default.
                   */
                  label: 'My custom filter',
                  template: {render(h) { return h('div', 'example') }}
                }
              }
            }
          ]
        }
      }
    }
  </script>
  ```
</docs>
