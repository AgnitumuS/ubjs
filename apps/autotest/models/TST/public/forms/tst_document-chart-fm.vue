<template>
  <div>
    <Uchart
      ref="one"
      :chart-data="chartData"
      @chart-click="clickOnChartHandler"
    />
    <span>Click on <b>{{ msg }}</b></span>
    <br>
    <br>
    <br>
    <div>
      <span>Графік з кастомнинми опціями:</span>
      <Uchart
        ref="two"
        :chart-data="chartData"
        :options="options"
        @chart-click="clickOnChartHandler"
      />
    </div>
  </div>
</template>
<script>
const { Form } = require('@unitybase/adminui-vue')
const Uchart =
  require('@unitybase/adminui-vue/components/UChart/UChart.vue').default

module.exports.default = {
  components: {
    Uchart
  },
  data () {
    return {
      msg: '',
      chartData: {
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
          datasets: [
            {
              label: 'Example DataSet',
              data: [65, 59, 80, 81, 56, 55, 40]
            }
          ]
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
        },
        onClick: () => console.log('дефолтна функція обробки onClick змінена')
      }
    }
  },
  methods: {
    clickOnChartHandler (clickData) {
      if (!clickData.length) return
      this.msg = clickData[0].label
    }
  }
}

module.exports.mount = function (cfg) {
  Form(cfg).mount()
}
</script>
