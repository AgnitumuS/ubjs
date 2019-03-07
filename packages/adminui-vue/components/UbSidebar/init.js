const Vue = require('vue')

const UbSidebar = require('./src/index.vue').default

module.exports = function () {
  const domEl = document.createElement('div')
  document.body.append(domEl)

  new Vue({
    render: (h) => h(UbSidebar)
  }).$mount(domEl)
}
