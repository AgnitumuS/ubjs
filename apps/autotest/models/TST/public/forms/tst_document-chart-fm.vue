<template>
  <div>
    <u-grid>
      <div>
        <span>Click handler (click on the bar)</span>
        <u-chart
          ref="one"
          :chart-data="chartData"
          @chart-click="chartClickHandler"
        />
      </div>
      <div>
        <span>Axis with Dates</span>
        <u-chart
          ref="three"
          type="line"
          :chart-data="datesData"
          :options="datesOptions"
        />
      </div>
      <div>
        <span>Options usage (changed border width and legend position)</span>
        <u-chart
          ref="two"
          type="pie"
          :chart-data="chartData"
          :options="options"
          @chart-click="chartClickHandler"
        />
      </div>
    </u-grid>
  </div>
</template>
<script>
const { Form } = require('@unitybase/adminui-vue')

module.exports.default = {
  data () {
    return {
      chartData: {
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr'],
          datasets: [{
            label: 'Example DataSet',
            data: [65, 59, 80, 81]
          }]
        }
      },
      options: {
        indexAxis: 'y',
        elements: {
          bar: {
            borderWidth: 2
          }
        },
        plugins: {
          legend: {
            position: 'right'
          }
        }
      },

      datesData: {
        data: {
          datasets: [{
            label: 'First Set (dates as objects)',
            data: [{
              x: new Date('2022-06-12T00:00Z'),
              y: 2
            }, {
              x: new Date('2022-06-14T00:00Z'),
              y: 7
            }, {
              x: new Date('2022-06-15T00:00Z'),
              y: 4
            }],
            borderColor: 'blue'
          }, {
            label: 'Second Set (dates as strings)',
            data: [{
              x: '2022-06-11T00:00Z',
              y: 8
            }, {
              x: '2022-06-12T00:00Z',
              y: 5
            }, {
              x: '2022-06-13T00:00Z',
              y: 4
            }, {
              x: '2022-06-15T00:00Z',
              y: 9
            }],
            borderColor: 'green'
          }]
        }
      },
      datesOptions: {
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day',
              displayFormats: {
                day: 'YYYY-MM-DD'
              }
            }
          }
        }
      }
    }
  },
  methods: {
    chartClickHandler (clickData) {
      if (!clickData.length) return
      this.$dialogInfo(`Clicked on -  data: ${clickData[0].data}   label:${clickData[0].label}`)
    }
  }
}

module.exports.mount = function (cfg) {
  Form(cfg).mount()
}
</script>
