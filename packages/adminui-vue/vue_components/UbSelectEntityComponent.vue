<template>
    <el-select ref="selector" v-model="resultData" :filter-method="filterMethod" filterable reserve-keyword clearable
               @change="$emit('input', resultData)" style="width: 100%" v-loading="loading" :disabled="loading"
               :class="`ub-select-entity--${this._uid}`"
               @focus="onFocus">
        <template slot-scope="scope">
            <el-option v-for="item in items" :key="item[primaryColumn]"
                       :label="item[displayValue]" :value="item[primaryColumn]">
            </el-option>
            <el-row type="flex" justify="end" style="padding: 0px 20px" v-if="hasData">
                <el-button type="text" @click="loadNext">{{buttonMoreCaption}}</el-button>
            </el-row>
        </template>
    </el-select>
</template>

<script>
  require('../css/ub-select.css')

  module.exports = {
    name: 'UbSelectEntityComponent',
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
      filterMethod () {
        let itemsLength = this.items.length || 0
        if (this.$refs.selector.selectedLabel !== this.oldValue) {
          itemsLength = 0
          let t = UB.Repository(this.entityName).attrs(this.primaryColumn, this.displayValue).start(itemsLength).limit(this.itemCount)

          if (this.$refs.selector.selectedLabel) {
            t = t.where(this.displayValue, 'contains', this.$refs.selector.selectedLabel)
          }

          t.select()
            .then((data) => {
              if (this.items.length > 0) this.items = []
              this.items.concat(data)
            })
        }
      },
      onFocus () {
        let itemsLength = this.items.length || 0
        if (itemsLength === 0 || this.$refs.selector.selectedLabel !== this.oldValue) {
          itemsLength = 0
          var t = UB.Repository(this.entityName).attrs(this.primaryColumn, this.displayValue).start(itemsLength).limit(this.itemCount)

          if (this.$refs.selector.selectedLabel) {
            t = t.where(this.displayValue, 'contains', this.$refs.selector.selectedLabel)
          }

          t.select()
            .then((data) => {
              if (this.items.length > 0) this.items = []
              this.items.concat(data)
            })
        }
      },
      initLoaderStyles () {
        let control = document.querySelector(`.ub-select-entity--${this._uid} .el-loading-spinner`)
        if (control) {
          control.classList.add('ub-select__loading-spinner')
          let svg = control.querySelector('.circular')
          if (svg) {
            svg.style.height = '100%'
          }
        }
      },
      loadByInput () {
        this.hasData = true
        this.items = []
        this.loadNext()
      },
      loadNext () {
        let itemsLength = this.items.length || 0
        let promise = UB.Repository(this.entityName).attrs(this.primaryColumn, this.displayValue).start(itemsLength).limit(this.itemCount)

        promise.select()
          .then((data) => {
            if (data.length > 0) this.items = this.items.concat(data)
            if (itemsLength + this.itemCount > this.items.length || data.length === 0) this.hasData = false
          })
      }
    },
    data () {
      return {
        oldValue: null,
        resultData: this.value,
        items: [],
        itemCount: 20,
        hasData: true,
        buttonMoreCaption: UB.i18n('more'),
        loading: false
      }
    },
    computed: {
      displayValue () {
        return $App.domainInfo.get(this.entityName).descriptionAttribute
      }
    },
    mounted () {
      setTimeout(function () {
        this.initLoaderStyles()
      }.bind(this), 1)
    }
  }
</script>
