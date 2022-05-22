const chartTypes = {
  bar: {
    name: 'BAR',
    code: 'bar',
    colors: 'one',
    options: {
      scales: {
        x: {
          ticks: {
            callback: function (a) {
              let label = this.getLabelForValue(a)
              label = label.toString()
              return label.length < 20 ? label : label.slice(0, 20) + '...'
            }
          }
        }
      }
    }
  },
  pie: {
    name: 'PIE',
    code: 'pie'
  },
  line: {
    name: 'LINE',
    code: 'line',
    colors: 'one'
  },
  polarArea: {
    name: 'polarArea',
    code: 'polarArea'
  }
}

module.exports = chartTypes
