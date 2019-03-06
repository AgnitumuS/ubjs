const UbRelogin = require('./src/index.vue').default

module.exports = function () {
  const id = 'relogin'
  const domEl = document.createElement('div')
  domEl.id = id
  document.body.append(domEl)

  new window.Vue({
    render: (h) => h(UbRelogin)
  }).$mount(`#${id}`)
}
