require('./css/index.css')

const Tabbar = require('./template/tabbar.vue')
const storeData = require('./store')

function subscribeToCentralPanelEvents(store) {
  $App.viewport.centralPanel.on({
    /**
     * React on adding a new tab to ExtJS "centralPanel".
     * @param sender
     * @param tab
     */
    add(sender, tab) {
      // When an ExtJS tab changes its title, need to sync it with tabbar
      tab.addListener('titlechange', (tab, newText) => {
        store.commit('TAB_TITLE', {tabId: tab.id, title: newText})
      })

      store.commit('ADD', {
        id: tab.id,
        title: tab.title,
        point: null
      })
    },

    remove(sender, tab) {
      const {tabs, current} = store.state
      const index = tabs.findIndex(t => t.id === tab.id)
      if (index !== -1) {
        store.commit('REMOVE', tab.id)
        if (current > index) {
          store.dispatch('onChangeActiveTab', tabs[current - 1].id)
        }
      }
    },

    async tabchange(sender, tab) {
      store.dispatch('onChangeActiveTab', tab.id)
    }
  })
}

module.exports = {
  replaceDefaultTabbar(){
    const {id} = UB.core.UBApp.viewport.centralPanel.tabBar
    const styles = document.createElement('style')
    styles.innerHTML = `#${ id }{display:none !important}`
    document.body.appendChild(styles)

    const store = new Vuex.Store(storeData)
    subscribeToCentralPanelEvents(store)

    new Vue({
      render: (h) => h(Tabbar),
      store
    }).$mount(`#${ id }`)
  }
}