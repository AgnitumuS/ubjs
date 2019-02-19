<template>
  <el-select ref="selector" v-model="resultData"
             reserve-keyword clearable filterable multiple
             remote :remote-method="loadNextByInput"
             v-loading="loading" :disabled="loading"
             @change="onChange"
             v-on:focus="onFocus"
             style="width: 100%"
             :class="`ub-select-many${this._uid}`">
    <template slot-scope="scope">
      <el-option v-for="item in itemsToDisplay" :key="item[primaryColumn]"
                 :label="item[displayValue]" :value="item[primaryColumn]"
                 :disabled="item.removed">
      </el-option>
      <el-row type="flex" justify="end" style="padding: 0 20px" v-if="hasData">
        <el-button type="text" @click="loadNextButtonClick">{{buttonMoreCaption}}</el-button>
      </el-row>
    </template>
  </el-select>
</template>

<script>
  require('../../css/ub-select.css')

  module.exports = {
    name: 'UbSelectMany',
    props: {
      value: {
        type: [String, Number]
      },
      entityName: {
        type: String,
        required: true
      },
      primaryColumn: {
        type: String,
        default () {
          return 'ID'
        }
      }
    },
    methods: {
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
      getPromise: function (startFrom) {
        let promise = this.$UB.Repository(this.entityName).attrs(this.primaryColumn, this.displayValue).start(startFrom || 0).limit(this.itemCount)
        if (this.$refs.selector.query) {
          promise = promise.where(this.displayValue, 'like', this.$refs.selector.query)
        }
        return promise
      },
      loadNextByInput: function (query) {
        let promise = this.getPromise()
        promise.select().then((data) => {
          this.items = []
          this.hasData = data.length === this.itemCount
          data.forEach(function (item) {
            this.items.push(item)
          }.bind(this))
        })
      },
      loadNextButtonClick () {
        let itemsLength = this.items.length || 0
        let promise = this.getPromise(itemsLength)
        promise.select().then((data) => {
          this.hasData = data.length === this.itemCount
          data.forEach(function (item) {
            this.items.push(item)
          }.bind(this))
        })
      }
    },
    data () {
      return {
        entitySchema: this.$UB.connection.domain.get(this.entityName, true),
        initialItem: null,
        items: [],
        resultData: [],
        itemCount: 20,
        hasData: true,
        buttonMoreCaption: this.$ut('more'),
        loading: false,
        listener: function () {
          this.items = []
        }.bind(this)
      }
    },
    computed: {
      valueArray () {
        return this.value ? this.value.trim().split(',').map((item) => {
          return typeof item !== 'number' ? parseInt(item) : item
        }) : null
      },
      displayValue () {
        return this.$UB.connection.domain.get(this.entityName).descriptionAttribute
      },
      itemsToDisplay () {
        if (this.initialItem && this.initialItem.length > 0) {
          let filteredItems = this.items.filter((item) => {
            return !this.initialItem.map((ii) => {return ii[this.primaryColumn]}).includes(item[this.primaryColumn])
          })
          return this.initialItem.concat(filteredItems)
        }
        return this.items
      }
    },
    destroyed () {
      this.$UB.connection.removeListener(`${this.entityName}:changed`, this.listener)
    },
    mounted () {
      setTimeout(function () {
        this.initLoaderStyles()
      }.bind(this), 1)

      this.$UB.connection.on(`${this.entityName}:changed`, this.listener)

      if (this.value) {
        this.loading = true
        let promise = this.$UB.Repository(this.entityName).attrs(this.primaryColumn, this.displayValue)
        if (Object.keys(this.entitySchema.mixins.mStorage || {}).includes('safeDelete') && this.entitySchema.mixins.mStorage.safeDelete === true) {
          promise = promise.attrs('mi_deleteDate').misc({__allowSelectSafeDeleted: true})
        }
        promise.where(this.primaryColumn, 'in', this.valueArray).select().then((data) => {
          this.initialItem = data
          this.initialItem.forEach((item) => {
            item.removed = !!item['mi_deleteDate'] && item['mi_deleteDate'] < new Date()
          })
          this.resultData = this.valueArray
        }).finally(() => {
          this.loading = false
        })
      }
    }
  }
</script>
