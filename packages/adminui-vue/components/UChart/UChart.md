A wrapper for [Chart.js](https://www.chartjs.org/) library

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
          datasets: [{
            label: 'Example DataSet',
            data: [65, 59, 80, 81, 56, 55, 40]
          }]
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
2. use of custom potions depending on chart type
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
      :chart-data="type === 'bubble' ? bubbleData : chartData"
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
      chartTypes: ['bar', 'line', 'pie', 'doughnut', 'bubble', 'polarArea', 'radar', 'scatter'],
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
          datasets: [{
            label: 'Example DataSet',
            data: [65, 59, 80, 81, 56, 55, 40],
          }]
        }
      },
      bubbleData: {
        data: {
          datasets: [{
            label: 'Bubbles',
            data: [{ x: 10, y: 20, r: 10 }, { x: 11, y: 20, r: 30 }]
          }]
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

## Usage with timeline

UChart includes adapter for `date` and uses moment as a date library under the hood. Adapter allows passing date values as
ISO-8601 strings or as `Date` objects.

For options see [Time Axis specific options](https://www.chartjs.org/docs/latest/axes/cartesian/time.html#time-axis-specific-options])
```vue
<template>
  <div>
    <u-chart
      :chart-data="chartData"
      type="line"
      :options="options"
    />
  </div>
</template>

<script>
export default {
  data () {
    return {
      options: {
        scales: {
          x: {
            type: 'time',
            // optional min date
            // min: '2022-06-10',
            time: {
              unit: 'day',
              // optional x axis format
              // displayFormats: {
              //   day: 'YYYY-MM-DD'
              // }
            }
          }
        }
      },
      chartData: {
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
      }
    }
  }
}
</script>
```