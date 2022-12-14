Ext.define('UB.ux.charts.UBColumnChart', {
  extend: 'Ext.chart.Chart',
  alias: 'widget.ubcolumnchart',
  style: 'background:#fff',
  animate: true,
  shadow: true,
  theme: 'Category1',
  legend: {
    position: 'right'
  },
  axes: [
    {
      type: 'Numeric',
      minimum: 0,
      position: 'left',
      fields: ['amount'],
      title: 'amount',
      minorTickSteps: 1,
      grid: {
        odd: {
          opacity: 1,
          fill: '#D4E1F2',
          stroke: '#bbb',
          'stroke-width': 0.5
        }
      }
    },
    {
      type: 'Category',
      position: 'bottom',
      fields: ['caption'],
      title: 'caption'
    }
  ],
  series: [
    {
      type: 'column',
      highlight: {
        size: 7,
        radius: 7
      },
      tips: {
        trackMouse: true,
        width: 250,
        height: 28,
        renderer: function (storeItem, item) {
          this.setTitle(storeItem.get('caption') + ': ' + storeItem.get('amount') + ' ' + UB.i18n('tasks'))
        }
      },
      extraStyle: {
        xAxis: {
          labelRotation: 45 // -90 through 90
        }
      },
      axis: 'left',
      xField: 'caption',
      yField: 'amount',
      markerConfig: {
        type: 'cross',
        size: 4,
        radius: 4,
        'stroke-width': 0
      }
    }
  ]
})
