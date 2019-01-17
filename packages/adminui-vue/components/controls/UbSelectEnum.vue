<template>
    <el-select v-model="resultData" filterable reserve-keyword clearable ref="selector"
               @change="$emit('input', resultData)"
               v-on:input.native="onInput"
               v-loading="loading" :disabled="loading"
               style="width: 100%"
               :class="`ub-select-enum${_uid}`">
        <template slot-scope="scope">
            <el-option v-for="item in items" :key="item[primaryColumn]"
                       :label="item[displayValue]" :value="item[primaryColumn]">
            </el-option>
        </template>
    </el-select>
</template>

<script>
  require('../../css/ub-select.css')

  module.exports = {
    name: 'UbSelectEnum',
    props: {
      value: {
        type: String
      },
      eGroup: {
        type: String
      },
      primaryColumn: {
        type: String,
        default () {
          return 'code'
        }
      }
    },
    data () {
      return {
        resultData: this.value,
        items: [],
        entityName: 'ubm_enum',
        loading: false,
        listener: function () {
          this.initData()
        }.bind(this)
      }
    },
    computed: {
      displayValue () {
        return $App.domainInfo.get(this.entityName).descriptionAttribute
      }
    },
    methods: {
      onInput () {
        if (!event.target.value) {
          this.resultData = null
          this.$refs.selector.emitChange(null)
        }
      },
      initLoaderStyles () {
        let control = document.querySelector(`.ub-select-enum${this._uid} .el-loading-spinner`)
        if (control) {
          control.classList.add('ub-select__loading-spinner')
          let svg = control.querySelector('.circular')
          if (svg) {
            svg.style.height = '100%'
          }
        }
      },
      initData() {
        this.loading = true
        let promise = UB.Repository(this.entityName)
          .attrs(this.primaryColumn, this.displayValue, 'eGroup')

        if (this.eGroup) promise = promise.where('eGroup', '=', this.eGroup)

        promise.select().then((data) => {
          this.items = data
          this.loading = false
        })
      }
    },
    destroyed() {
      $App.connection.removeListener(`${this.entityName}:changed`, this.listener)
    },
    mounted () {
      setTimeout(function () {
        this.initLoaderStyles()
      }.bind(this), 1)

      $App.connection.on(`${this.entityName}:changed`, this.listener)

      this.initData()
    }
  }
</script>