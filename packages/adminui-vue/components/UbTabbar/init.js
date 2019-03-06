const Vue = require('vue')
const UbTabbar = require('./src/index.vue').default

module.exports = function () {
  const { id } = window.UB.core.UBApp.viewport.centralPanel.tabBar
  const styles = document.createElement('style')
  styles.innerHTML = `#${id}{display:none !important}`
  document.body.appendChild(styles)

  new Vue({
    mounted () {
      const { offsetHeight } = this.$el
      window.UB.core.UBApp.viewport.centralPanel.setMargin(`-${offsetHeight} 0 0 0`)
      window.UB.core.UBApp.viewport.centralPanel.tabBar.setHeight(offsetHeight)
    },
    render: (h) => h(UbTabbar)
  }).$mount(`#${id}`)
}
