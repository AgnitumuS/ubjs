<template>
  <div class="u-chart">
    <div class="chart-container">
      <canvas
        ref="canvas"
        class="canva"
      />
    </div>
  </div>
</template>

<script>
/* global SystemJS, _ */
const chartTypes = require('./chartTypes/chartTypes.js')
const colorsDefault = require('./colors.js')

export default {
  name: 'UChart',
  props: {
    /**
     * the data structure must match the library structure ChartJs
     */
    chartData: {
      type: Object,
      default: () => ({})
    },
    /**
     * your options will override the default options
     */
    options: {
      type: Object,
      default: null
    },
    /**
     * chart type. Must match the library chart type
     */
    type: {
      type: String,
      default: 'bar'
    }
  },
  data () {
    return {
      chartTypes,
      chartInstance: null,
      ctx: null,
      blockRender: false // if will change data, chart type and options together - this will block double render
    }
  },
  computed: {
    currentChartType () {
      const type = this.chartTypes[this.type]
      return _.merge({}, type) || {}
    }
  },
  watch: {
    type () {
      this.drawChart()
    },
    chartData: {
      deep: true,
      handler () {
        this.drawChart()
      }
    },
    options: {
      deep: true,
      handler () {
        this.drawChart()
      }
    }
  },
  async mounted () {
    const moduleName = 'chart.js'
    const libAlreadyLoaded = SystemJS.has(moduleName)
    if (!libAlreadyLoaded) {
      this.Chart = await SystemJS.import(moduleName)
      SystemJS.set(
        moduleName,
        SystemJS.newModule({ exportedFunction: this.Chart })
      )
      this.setDefaultsParams()
      this.drawChart()
      return
    }
    this.Chart = SystemJS.get(moduleName).exportedFunction
    this.drawChart()
  },
  methods: {
    setDefaultsParams () {
      this.Chart.defaults.backgroundColor = colorsDefault
      this.Chart.defaults.onClick = (event, elemData, chart) => {
        const { datasets, labels } = chart.data
        const clickData = elemData.map((elem) => {
          const { datasetIndex, index } = elem
          return {
            data: datasets[datasetIndex].data[index],
            label: labels[index]
          }
        })
        /**
         * Triggers when the user click on chart area. NOTE! This event will not work if you specify your own click handling function in the options
         *
         * @param {Array} clickData: consists of clicked data
         * @param {Array} pluginEventData: consists of parameters that are passed by the plugin
         */
        this.$emit('chart-click', clickData, [event, elemData, chart])
      }
    },
    chartRender (ctx, chartData) {
      chartData.options = !this.options
        ? this.currentChartType.options
        : _.merge(this.currentChartType.options, this.options)
      chartData.type = this.type
      return new this.Chart(ctx, chartData)
    },
    drawChart () {
      if (this.blockRender) return
      this.blockRender = true
      if (this.chartInstance) this.chartInstance.destroy()
      this.$nextTick(() => {
        this.chartInstance = this.chartRender(
          this.$refs.canvas.getContext('2d'),
          this.chartData
        )
        this.blockRender = false
      })
    }
  }
}
</script>

<style>
.u-chart {
  width: 100%;
}
.elem {
  display: inline-block;
  width: 50px;
  height: 50px;
}

.chart-container {
  height: 100%;
}
</style>
