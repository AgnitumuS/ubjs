require('./ub-relogin.css')

let UbRelogin = require('./src/index.vue')

if (BOUNDLED_BY_WEBPACK) {
  UbRelogin = UbRelogin.default
}

module.exports = {
  replaceDefaultRelogin () {
    const id = 'relogin'
    const domEl = document.createElement('div')
    domEl.id = id
    document.body.append(domEl)

    new window.Vue({
      render: (h) => h(UbRelogin)
    }).$mount(`#${id}`)
  }
}
