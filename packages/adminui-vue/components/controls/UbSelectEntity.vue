<template>
    <div>
        <el-select ref="selector" v-model="resultData"
                   reserve-keyword clearable filterable remote
                   :remote-method="loadNextByInput"
                   v-loading="loading"
                   :disabled="loading"
                   v-on:mouseover.native="mouseOver"
                   v-on:mouseout.native="mouseOver"
                   @change="onChange"
                   v-on:click.native="onFocus"
                   style="width: 100%"
                   :class="`ub-select-entity${this._uid}`">
            <div slot="suffix" v-show="showActions">
                <i class="ub-select-entity__suffix_icon el-icon-circle-plus-outline"></i>
                <i class="ub-select-entity__suffix_icon el-icon-edit"></i>
                <i class="ub-select-entity__suffix_icon el-icon-menu"></i>
                <i class="ub-select-entity__suffix_icon el-icon-circle-close" v-if="this.resultData"></i>
            </div>
            <template slot-scope="scope">
                <el-option v-for="item in itemsToDisplay" :key="item[primaryColumn]"
                           :label="item[displayValue]" :value="item[primaryColumn]">
                </el-option>
                <el-row type="flex" justify="end" style="padding: 0px 20px" v-if="hasData">
                    <el-button type="text" @click="loadNextButtonClick">{{buttonMoreCaption}}</el-button>
                </el-row>
            </template>
        </el-select>
    </div>
</template>

<script>
  require('../../css/ub-select.css')

  module.exports = {
    name: 'UbSelectEntity',
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
      mouseOver () {
        this.showActions = !this.showActions
      },
      onChange (data) {
        this.initialItem = this.items.find((el) => {
          return el[this.primaryColumn] === data
        })
        this.searchValue = this.initialItem ? this.initialItem[this.displayValue] : ''
        this.items = []
        this.$emit('input', data)
      },
      onFocus () {
        if (this.items.length === 0) {
          this.loadNextButtonClick()
        }
      },
      initLoaderStyles () {
        let control = document.querySelector(`.ub-select-entity${this._uid} .el-loading-spinner`)
        if (control) {
          control.classList.add('ub-select__loading-spinner')
          let svg = control.querySelector('.circular')
          if (svg) {
            svg.style.height = '100%'
          }
        }
      },
      getPromise: function (startFrom) {
        let promise = UB.Repository(this.entityName).attrs(this.primaryColumn, this.displayValue).start(startFrom || 0).limit(this.itemCount)
        if (this.searchValue) {
          promise = promise.where(this.displayValue, 'like', this.searchValue)
        }
        return promise
      },
      loadNextByInput: function (query) {
        this.searchValue = query
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
        initialItem: null,
        resultData: this.value,
        items: [],
        itemCount: 20,
        hasData: true,
        buttonMoreCaption: UB.i18n('more'),
        loading: false,
        searchValue: '',
        listener: function () {
          this.items = []
        }.bind(this),
        showActions: false
      }
    },
    computed: {
      displayValue () {
        return $App.domainInfo.get(this.entityName).descriptionAttribute
      },

      itemsToDisplay () {
        if (this.initialItem) {
          let filteredItems = this.items.filter((item) => {
            return item[this.primaryColumn] !== this.initialItem[this.primaryColumn]
          })
          filteredItems.unshift(this.initialItem)
          return filteredItems
        }
        return this.items
      }
    },
    destroyed () {
      $App.connection.removeListener(`${this.entityName}:changed`, this.listener)
    },
    mounted () {
      setTimeout(function () {
        this.initLoaderStyles()
      }.bind(this), 1)

      $App.connection.on(`${this.entityName}:changed`, this.listener)

      if (this.value) {
        this.loading = true
        UB.Repository(this.entityName).attrs(this.primaryColumn, this.displayValue).selectById(this.value).then((item) => {
          if (item) {
            this.initialItem = {}
            this.initialItem[this.primaryColumn] = this.value
            this.initialItem[this.displayValue] = item[this.displayValue]
          }
        }).finally(() => {
          this.loading = false
        })
      }
    }
  }
</script>

<style>
    .ub-select-entity__suffix_icon {
        margin-right: 5px;
    }
</style>