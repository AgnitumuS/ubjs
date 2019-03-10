const Vue = require('vue')
const UbTabbar = require('./UNavbar.vue').default
const UB = require('@unitybase/ub-pub')

module.exports = function () {
  const { id } = UB.core.UBApp.viewport.centralPanel.tabBar
  const styles = document.createElement('style')
  styles.innerHTML = `#${id}{display:none !important}`
  document.body.appendChild(styles)

  new Vue({
    mounted () {
      const { offsetHeight } = this.$el
      window.UB.core.UBApp.viewport.centralPanel.setMargin(`-${offsetHeight} 0 0 0`)
      window.UB.core.UBApp.viewport.centralPanel.tabBar.setHeight(offsetHeight)
    },
    render: (h) => h(UbTabbar, {
      props: {
        withHamburger: UB.connection.appConfig.uiSettings.adminUI.customSidebar
      }
    })
  }).$mount(`#${id}`)
}
