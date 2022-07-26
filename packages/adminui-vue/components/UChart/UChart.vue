<template>
  <div class="u-chart">
    <canvas ref="canvas" />
  </div>
</template>

<script>
/* global SystemJS, _ */
const CHART_DEFAULTS = {
  bar: {
    options: {
      scales: {
        x: {
          ticks: {
            callback: truncLabel
          }
        }
      }
    }
  },
  pie: { },
  line: { },
  polarArea: { }
}

const COLOR_DEFAULTS = [
  '#49afff',
  '#6bCb77',
  '#ffd93d',
  '#ff8888',
  '#ffaf51',
  '#d76349',
  '#4687d7',
  '#aed6d6',
  '#44aeae',
  '#aed765',
  '#af62af',
  '#6261af',
  '#9f9699',
  '#c2cf5d',
  '#83a1e8',
  '#b971d5',
  '#159eff',
  '#ff9d1d',
  '#ff6c6c',
  '#ce3d16',
  '#126cce',
  '#9dcdcd',
  '#109d9d',
  '#9dcf3e',
  '#9e3c9e',
  '#3d3c9d',
  '#8b7f82'
]

/**
 * @type Chart
 */
let ChartJs

/**
 * Asynchronously loads chart.js library (if not already loaded), add date adapter and default colors
 *
 * @returns {Promise<Chart<ChartType, DefaultDataPoint<TType>, unknown>>}
 */
async function initChartJS () {
  if (ChartJs) return ChartJs
  const moduleName = 'chart.js'
  ChartJs = await SystemJS.import(moduleName)
  dateAdapter(window.moment, ChartJs)
  ChartJs.defaults.backgroundColor = COLOR_DEFAULTS
}

export default {
  name: 'UChart',
  props: {
    /**
     * See [chart types](https://www.chartjs.org/docs/latest/)
     *
     * @values bar, line, pie, doughnut, bubble, polarArea, radar, scatter
     */
    type: {
      type: String,
      default: 'bar'
    },
    /**
     * Data for chart - see [Chart.js data structures](https://www.chartjs.org/docs/latest/general/data-structures.html).
     *
     * Chart data is NOT reactive.
     * In run-time either re-assign a whole data object or (in case some inner values changed) call `rerenderChart()` manually
     */
    chartData: {
      type: Object,
      default: () => ({})
    },
    /**
     * Chart options, depends on chart type - see [Chart.js options](https://www.chartjs.org/docs/latest/general/options.html)
     *
     * Chart options is NOT reactive - to re-render chart after options changed in run-time `rerenderChart()` should be called
     */
    options: {
      type: Object,
      default: null
    }
  },
  watch: {
    type () {
      this.rerenderChart()
    },
    chartData () {
      this.rerenderChart()
    }
  },
  async mounted () {
    await initChartJS()
    this.rerenderChart()
  },
  methods: {
    /**
     * can be called manually after chart data or chart options is changed to re-render chart
     */
    rerenderChart () {
      if (this.chartInstance) this.chartInstance.destroy()
      this.$nextTick(() => {
        /**
         * Direct access to ChartJs instance
         *
         * @type {Chart}
         */
        this.chartInstance = this._doRenderChart(
          this.$refs.canvas.getContext('2d'),
          this.chartData
        )
      })
    },
    _doRenderChart (ctx, chartData) {
      chartData.options = _.merge({}, CHART_DEFAULTS[this.type], this.options)
      chartData.type = this.type
      if (!chartData.options.onClick) {
        chartData.options.onClick = (event, elemData, chart) => {
          const { datasets, labels } = chart.data
          const clickedData = elemData.map((elem) => {
            const { datasetIndex, index } = elem
            return {
              data: datasets[datasetIndex].data[index],
              label: labels[index]
            }
          })
          /**
           * Triggers when user clicks on the chart area. NOTE! This event is not works if `onClick` handler is specified in the chart options
           *
           * @param {Array<{data: *, label: string}>} clickData data point user clicks on
           * @param {Array} pluginEventData consists of parameters that passed by the plugin
           */
          this.$emit('chart-click', clickedData, [event, elemData, chart])
        }
      }
      return new ChartJs(ctx, chartData)
    }
  }
}

/**
 * Truncate label up to 20 chars
 * @param {number} value
 * @returns {string}
 */
function truncLabel (value) {
  let label = this.getLabelForValue(value)
  label = label.toString()
  return label.length < 20 ? label : label.slice(0, 20) + '...'
}

/**
 * Date adapter for ChartJs
 * copy-pasted from chartjs-adapter-moment https://github.com/chartjs/chartjs-adapter-moment
 *
 * @param moment
 * @param chartModule
 */
function dateAdapter (moment, chartModule) {
  // defaults for time.displayFormats
  const FORMATS = {
    datetime: 'MMM D, YYYY, h:mm:ss a',
    millisecond: 'h:mm:ss.SSS a',
    second: 'h:mm:ss a',
    minute: 'h:mm a',
    hour: 'hA',
    day: 'MMM D',
    week: 'll',
    month: 'MMM YYYY',
    quarter: '[Q]Q - YYYY',
    year: 'YYYY'
  }
  chartModule._adapters._date.override({
    _id: 'moment', // DEBUG ONLY

    formats: function () {
      return FORMATS
    },
    parse: function (value, format) {
      if (typeof value === 'string' && typeof format === 'string') {
        value = moment(value, format)
      } else if (!(value instanceof moment)) {
        value = moment(value)
      }
      return value.isValid() ? value.valueOf() : null
    },
    format: function (time, format) {
      return moment(time).format(format)
    },
    add: function (time, amount, unit) {
      return moment(time).add(amount, unit).valueOf()
    },
    diff: function (max, min, unit) {
      return moment(max).diff(moment(min), unit)
    },
    startOf: function (time, unit, weekday) {
      time = moment(time)
      if (unit === 'isoWeek') {
        weekday = Math.trunc(Math.min(Math.max(0, weekday), 6))
        return time.isoWeekday(weekday).startOf('day').valueOf()
      }
      return time.startOf(unit).valueOf()
    },
    endOf: function (time, unit) {
      return moment(time).endOf(unit).valueOf()
    }
  })
}

</script>

<style>
.u-chart {
  width: 100%;
  height: 100%;
}
</style>
