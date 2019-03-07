const UbRelogin = require('./src/index.vue').default

module.exports = function () {
  const domEl = document.createElement('div')
  document.body.append(domEl)

  new window.Vue({
    render: (h) => h(UbRelogin)
  }).$mount(domEl)
}
