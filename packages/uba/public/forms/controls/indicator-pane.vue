<template>
  <div
    class="indicator-pane"
  >
    <el-tag
      v-for="(indicator, index) of visibleIndicators"
      :key="index"
      :type="getIndicatorType(indicator)"
      :size="getIndicatorSize(indicator)"
      :effect="getIndicatorStyle(indicator)"
      class="indicator-pane__indicator"
    >
      {{ $ut(indicator.text) }}
    </el-tag>
  </div>
</template>

<script>
  const {mapState} = require('vuex')

  export default {
    name: 'IndicatorPane',

    computed: {

      indicators() {
        return this.scriptModule?.getIndicators() || []
      },

      visibleIndicators() {
        return this.indicators.filter(indicator => this.isVisibleIndicator(indicator))
      }
    },

    methods: {
      isVisibleIndicator(indicator) {
        return indicator.text && (indicator.visible || !('visible' in indicator))
      },

      getIndicatorType(indicator) {
        return ['success', 'info', 'warning', 'danger'].find(type => type === indicator.type) || ''
      },

      getIndicatorSize(indicator) {
        return ['medium', 'small', 'mini'].find(size => size === indicator.size) || ''
      },

      getIndicatorStyle(indicator) {
        return ['dark', 'light', 'plain'].find(style => style === indicator.style) || 'light'
      }
    }
  }
</script>

<style>
  .indicator-pane {
    margin: 0 20px 0 0;
  }

  .indicator-pane__indicator {
    margin: 0 0 0 15px;
  }
</style>
