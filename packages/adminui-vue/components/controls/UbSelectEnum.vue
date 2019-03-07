<template>
  <el-select ref="selector"
             v-model="resultData"
             v-loading="loading"
             filterable reserve-keyword clearable
             :disabled="loading || disabled"
             :class="`ub-select-enum${_uid}`"
             style="width: 100%"
             @change="$emit('input', resultData)"
             @input.native="onInput">
    <template>
      <el-option v-for="item in items"
                 :key="item[primaryColumn]"
                 :label="item[displayValue]"
                 :value="item[primaryColumn]"
      ></el-option>
    </template>
  </el-select>
</template>

<script>
require('../../css/ub-select.css')

module.exports = {
  name: 'UbSelectEnum',
  props: {
    value: {
      type: [String, Number]
    },
    eGroup: {
      type: String
    },
    disabled: Boolean,
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
      listener: _ => {
        this.initData()
      }
    }
  },
  computed: {
    displayValue () {
      return this.$UB.connection.domain.get(this.entityName).descriptionAttribute
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
    initData () {
      this.loading = true
      this.$UB.Repository(this.entityName)
        .attrs(this.primaryColumn, this.displayValue, 'eGroup')
        .whereIf(this.eGroup, 'eGroup', '=', this.eGroup)
        .select().then((data) => {
          this.items = data
          this.loading = false
        })
    }
  },
  destroyed () {
    this.$UB.connection.removeListener(`${this.entityName}:changed`, this.listener)
  },
  watch: {
    value () {
      this.resultData = this.value
    }
  },
  mounted () {
    setTimeout(_ => {
      this.initLoaderStyles()
    }, 1)

    this.$UB.connection.on(`${this.entityName}:changed`, this.listener)

    this.initData()
  }
}
</script>
