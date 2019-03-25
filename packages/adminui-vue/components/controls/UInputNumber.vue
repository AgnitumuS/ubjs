<script>
const UBDomain = require('@unitybase/cs-shared').UBDomain

// TODO - use el-input and implement:
//   - formatting output according to current user locale,
//   - filter only numeric keys (and separator if float/currency)
//   - optional right-alignment?
/**
 * Editor for Numeric data types: 'Int', 'BigInt', 'ID', Float, Currency
 * HOC for ElInputNumber. Knows about precisions of each data type. Aligned to right
 */
module.exports = {
  name: 'UInputNumber',
  props: {
    entityName: {
      type: String,
      required: true
    },
    attributeName: {
      type: String,
      required: true
    }
  },
  computed: {
    entitySchema () {
      return this.$UB.connection.domain.get(this.entityName)
    },
    dataType () {
      return this.entitySchema.attributes[this.attributeName].dataType
    },
    step () {
      let res
      if (this.dataType === 'Float') {
        res = 1 / Math.pow(1, UBDomain.FLOATING_SCALE_PRECISION - 1)
      } else if (this.dataType === 'Currency') {
        res = 0.1
      } else {
        res = 1
      }
      return res
    },
    precision () {
      if (this.dataType === 'Float') return UBDomain.FLOATING_SCALE_PRECISION
      if (this.dataType === 'Currency') return 2
      if (['Int', 'BigInt', 'ID'].includes(this.dataType)) return 0
    }
  }
}
</script>

<template>
  <el-input-number
    v-bind="$attrs"
    :precision="precision"
    :step="step"
    :controls="false"
    class="u-input-number"
    v-on="$listeners"
  />
</template>

<style>
  .u-input-number .el-input__inner {
    text-align: right;
  }
</style>
