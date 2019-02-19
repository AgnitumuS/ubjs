require('./css/index.css')

const Tabbar = require('./template/tabbar.vue')

module.exports = {
  replaceDefaultTabbar () {
    const {id} = window.UB.core.UBApp.viewport.centralPanel.tabBar
    const styles = document.createElement('style')
    styles.innerHTML = `#${id}{display:none !important}`
    document.body.appendChild(styles)

    new window.Vue({
      render: (h) => h(Tabbar)
    }).$mount(`#${id}`)
  }
}
