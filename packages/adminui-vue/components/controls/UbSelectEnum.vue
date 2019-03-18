<template>
  <el-select
    ref="selector"
    v-model="resultData"
    v-loading="loading"
    clearable
    :disabled="loading || disabled"
    :class="`ub-select-enum${_uid}`"
    style="width: 100%"
    @change="$emit('input', resultData)"
    @input.native="onInput"
  >
    <template>
      <el-option
        v-for="item in items"
        :key="item[primaryColumn]"
        :label="item[displayValue]"
        :value="item[primaryColumn]"
      />
    </template>
  </el-select>
</template>

<script>
require('../../css/ub-select.css')

const ENUM_ENTITY = 'ubm_enum'

module.exports = {
  name: 'UbSelectEnum',
  props: {
    value: {
      type: [String, Number]
    },
    // TODO - pass entityCode, add attrCode, clearable only in case attr allow null
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
      loading: false
    }
  },
  computed: {
    displayValue () {
      return this.$UB.connection.domain.get(ENUM_ENTITY).descriptionAttribute
    }
  },
  methods: {
    onInput () {
      if (!event.target.value) {
        this.resultData = null
        this.$refs.selector.emitChange(null)
      }
    },
    loadData () {
      this.loading = true
      this.$UB.Repository(ENUM_ENTITY)
        .attrs(this.primaryColumn, this.displayValue, 'eGroup')
        .whereIf(this.eGroup, 'eGroup', '=', this.eGroup)
        .select().then((data) => {
          this.items = data
          this.loading = false
        })
    }
  },
  destroyed () {
    this.$UB.connection.removeListener(`${ENUM_ENTITY}:changed`, this.loadData)
  },
  watch: {
    value () {
      this.resultData = this.value
    }
  },
  mounted () {
    this.$UB.connection.on(`${ENUM_ENTITY}:changed`, this.loadData)
    this.loadData()
  }
}
</script>
