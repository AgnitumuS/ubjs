<template>
  <el-select
    ref="selector"
    v-model="resultData"
    v-loading="loading"
    clearable
    filterable
    multiple
    remote
    :remote-method="loadNextByInput"
    :disabled="loading || disabled"
    :class="`ub-select-many${_uid}`"
    style="width: 100%"
    @change="onChange"
    @click.native="onFocus"
    @focus.native="onFocus"
  >
    <el-option
      v-for="item in availableOptions"
      :key="item[primaryColumn]"
      :label="item[displayValue]"
      :value="item[primaryColumn]"
      :disabled="item.removed"
    />
    <el-row
      v-if="hasData"
      type="flex"
      justify="end"
      style="padding: 0 20px"
    >
      <el-button
        type="text"
        @click="loadNextButtonClick"
      >
        {{ $ut('more') }}
      </el-button>
    </el-row>
  </el-select>
</template>

<script>
/**
* Component for select UB many type property.
*/
export default {
  name: 'USelectMany',
  props: {
    /**
     * Array of selected IDs as string joined by ,
     * @model
     */
    value: {
      type: String
    },
    /**
     * Name of entity or UB.Repository
     */
    entity: {
      type: [String, Object],
      required: true
    },
    /**
     * Set disabled status
     */
    disabled: Boolean
  },

  data () {
    return {
      primaryColumn: 'ID',
      initialItem: null,
      items: [],
      resultData: this.setResultData(),
      itemCount: 20,
      hasData: true,
      loading: false,
      listener: () => {
        this.items = []
      }
    }
  },

  computed: {
    initRepository () {
      if (typeof this.entity === 'string') {
        return this.$UB.Repository(this.entity)
      } else {
        return this.entity
      }
    },

    entityName () {
      return this.initRepository.entityName
    },

    entitySchema () {
      return this.$UB.connection.domain.get(this.entityName)
    },

    displayValue () {
      return this.entitySchema.descriptionAttribute
    },

    repository () {
      const hasPrimaryColumn = !this.initRepository.fieldList.includes(this.primaryColumn)
      const hasDisplayValue = !this.initRepository.fieldList.includes(this.displayValue)
      return this.initRepository
        .attrsIf(hasPrimaryColumn, this.primaryColumn)
        .attrsIf(hasDisplayValue, this.displayValue)
    },

    availableOptions () {
      if (this.initialItem && this.initialItem.length > 0) {
        let filteredItems = this.items.filter((item) => {
          return !this.initialItem.map(ii => { return ii[this.primaryColumn] }).includes(item[this.primaryColumn])
        })
        return this.initialItem.concat(filteredItems)
      }
      return this.items
    }
  },

  watch: {
    value () {
      if (this.value !== this.resultData.join(',')) {
        this.setResultData()
        this.setInitialItem()
      }
    }
  },

  mounted () {
    // this.$nextTick(this.initLoaderStyles)
    this.$UB.connection.on(`${this.entityName}:changed`, this.listener)
    this.setInitialItem()
  },

  destroyed () {
    this.$UB.connection.removeListener(`${this.entityName}:changed`, this.listener)
  },

  methods: {
    setInitialItem () {
      if (this.value) {
        if (this.value !== this.resultData.join(',')) {
          this.setResultData()
        }
        this.loading = true
        let isSafeDelete = this.entitySchema.attributes['mi_deleteDate']
        this.repository
          .attrsIf(isSafeDelete, 'mi_deleteDate')
          .miscIf(isSafeDelete, { __allowSelectSafeDeleted: true })
          .where(this.primaryColumn, 'in', this.resultData)
          .select().then((data) => {
            this.initialItem = data
            this.initialItem.forEach((item) => {
              item.removed = !!item['mi_deleteDate'] && item['mi_deleteDate'] < new Date()
            })
          }).finally(() => {
            this.loading = false
          })
      }
    },

    onChange (data) {
      this.initialItem = this.items.find((el) => {
        return el[this.primaryColumn] === data
      })
      if (this.$refs.selector.query) this.items = []
      this.$emit('input', data.join(','))
    },

    onFocus () {
      if (this.items.length === 0) {
        this.loadNextButtonClick()
      }
    },

    initLoaderStyles () {
      let control = document.querySelector(`.ub-select-many${this._uid} .el-loading-spinner`)
      if (control) {
        control.classList.add('ub-select__loading-spinner')
        let svg = control.querySelector('.circular')
        if (svg) {
          svg.style.height = '100%'
        }
      }
    },

    getItems (startFrom) {
      return this.repository
        .start(startFrom || 0)
        .limit(this.itemCount)
        .whereIf(this.$refs.selector.query, this.displayValue, 'like', this.$refs.selector.query)
    },

    loadNextByInput () {
      this.getItems()
        .select().then(data => {
          this.items = []
          this.hasData = data.length === this.itemCount
          data.forEach(item => {
            this.items.push(item)
          })
        })
    },

    loadNextButtonClick () {
      let itemsLength = this.items.length || 0
      this.getItems(itemsLength)
        .select().then(data => {
          this.hasData = data.length === this.itemCount
          data.forEach(item => {
            this.items.push(item)
          })
        })
    },

    setResultData () {
      this.resultData = this.value ? this.value.trim().split(',').map(item => {
        return typeof item !== 'number' ? parseInt(item, 10) : item
      }) : []
    }
  }
}
</script>

<style>
.ub-select__loading-spinner {
  top: 0;
  margin-top: 0;
  height: 100%;
}
</style>

<docs>
UbSelectEnum:

```vue
<template>
  <u-select-many
    v-model="value"
    entity="tst_dictionary"
  />
</template>
<script>
  export default {
    data () {
      return {
        value: '1,2'
      }
    }
  }
</script>
```
</docs>
