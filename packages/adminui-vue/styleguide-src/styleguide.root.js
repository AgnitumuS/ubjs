import Vue from 'vue'
import Vuex from 'vuex'
import UB from '@unitybase/ub-pub'
import { change } from '../utils/Form/helpers'

export default (previewComponent) => {
  const store = new Vuex.Store({
    getters: {
      entityName () {
        return 'doc_department'
      },
      entitySchema (state, getters) {
        return UB.connection.domain.get(getters.entityName)
      }
    },
    state: {
      collections: {
        passportPages: {
          deleted: [],
          entity: 'buc_fileCollection',
          items: [],
          key: 'passportPages'
        }
      }
    },
    mutations: {
      SET_DATA (state, { collection, index, key, value, path }) {
        debugger
        this.$set(this.$store.state.data, key, value)
        // change(state, key, value, path)
      }
    }
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
         * UB.connection.domain === null
        */
        setTimeout(() => {
          this.$UB.connection.Repository('doc_department').attrs([
            'ID',
            'name',
            'address',
            'phone',
            'isMain',
            'status',
            'description',
            'createDate',
            'boss',
            'logo',
            'topManagers'
          ])
            .selectSingle()
            .then(data => {
              console.log(data)
              this.$set(this.$store.state, 'data', data)
              this.$set(this.$store.state, 'originalData', data)
              this.authReady = true
            })
        }, 1000)
      })
    },

    store
  }
}
