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
        return this.$UB.connection.appConfig.storeDefaultPageSize
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

<docs>
  Entity attributes with dataType `Text`, `BLOB`, `TimeLog` did not have default render component,
  If you need to render this dataTypes, render it by named column slots.
  You need to decide to display this column type with great caution because this column can create large server requests.

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
  Need to set function which returns UB Repository.

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
  Columns array can contain strings or objects.

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
  In this case another columns will be shown as usual.
  Slot scope will pass `value`, `row`, and `column`.

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
  Custom column always required to have slot, because entity doesn't have data for this column.

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
