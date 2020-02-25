import Vuex from 'vuex'
import UB from '@unitybase/ub-pub'

export default (previewComponent) => {
  const store = new Vuex.Store({
    // getters: {
    //   entityName () {
    //     return 'tst_dictionary'
    //   },
    //
    //   entitySchema (state, getters) {
    //     return UB.connection.domain.get(getters.entityName)
    //   }
    // }
  })
  return {
    render (createElement) {
      if (this.authReady) {
        return createElement(previewComponent)
      } else {
        return createElement('div', 'loading')
      }
    },

    data () {
      return {
        authReady: this.$UB.connection.isAuthorized()
      }
    },

    created () {
      this.$UB.connection.on('authorized', () => {
        /*
         * added setTimeout (maybe need to remove it)
         * because when authorized event is triggered
         * UB.connection.domail === null
        */
        setTimeout(() => {
          this.authReady = true
        }, 1000)
      })
    },

    store
  }
}
