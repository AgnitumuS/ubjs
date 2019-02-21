require('./css/index.css')
// window.BOUNDLED_BY_WEBPACK = true // temporary
let Tabbar = require('./template/tabbar.vue')

if (BOUNDLED_BY_WEBPACK) {
  Tabbar = Tabbar.default
}

module.exports = {
  replaceDefaultTabbar () {
    const {id} = window.UB.core.UBApp.viewport.centralPanel.tabBar
    const styles = document.createElement('style')
    styles.innerHTML = `#${id}{display:none !important}`
    document.body.appendChild(styles)

    new window.Vue({
      render: (h) => h(Tabbar),
      mounted () {
        const {offsetHeight} = this.$el
        window.UB.core.UBApp.viewport.centralPanel.setMargin(`-${offsetHeight} 0 0 0`)
        window.UB.core.UBApp.viewport.centralPanel.tabBar.setHeight(offsetHeight)
      }
    }).$mount(`#${id}`)
  }
}
