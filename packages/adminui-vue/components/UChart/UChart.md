The component is a wrapper for the library [ChartJs](https://www.chartjs.org/)
You can do everything the library can do, except include plugins. This option is currently under development

## Basic Usage
```vue
<template>
    <u-chart
      :chart-data="chartData"
      type="bar"
    />
</template>

<script>
export default {
  data () {
    return {
      chartData: {
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
          datasets: [
            {
              label: 'Example DataSet',
              data: [65, 59, 80, 81, 56, 55, 40],
            }
          ]
        }
      }
    }
  }
}
</script>
```

## Advance Usage
In this example: 
1. chart switcher
2. the use of custom chart options by condition will be used (fill for line chart)
3. chart click handling 
```vue
<template>
  <div>
    <label>Choose chart type
      <select v-model="type">
        <option
          v-for="value in chartTypes"
          :key="value"
        >{{ value }}</option>
      </select>
    </label>
    <u-chart
      :chart-data="chartData"
      :type="type"
      :options="type === 'line' ? options : null"
      @chart-click="chartClickHandle"
    />
    <b>{{msg}}</b>
  </div>
</template>

<script>
export default {
  data () {
    return {
      chartTypes: ['bar', 'line', 'pie'],
      type: 'bar',
      options: {
        elements: {
          line: {
            fill: true
          }
        }
      },
      chartData: {
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
          datasets: [
            {
              label: 'Example DataSet',
              data: [65, 59, 80, 81, 56, 55, 40],
            }
          ]
        }
      },
      msg: ''
    }
  },
  methods: {
    chartClickHandle (data) {
      this.msg = `Click on -  data: ${data[0].data}   label:${data[0].label}`
    }
  }
}
</script>
```