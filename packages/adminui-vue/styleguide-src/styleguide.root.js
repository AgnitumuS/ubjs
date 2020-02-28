import Vuex from 'vuex'
import UB from '@unitybase/ub-pub'

let docDepartmentData
UB.connection.Repository('doc_department').attrs([
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
  .then(function (data) {
    docDepartmentData = data
    console.log(docDepartmentData)
  })
export default (previewComponent) => {
  const store = new Vuex.Store({
    getters: {
      entityName () {
        return 'cdn_country'
      },
      entitySchema (state, getters) {
        return UB.connection.domain.get(getters.entityName)
      }
    },
    state: {
      data: docDepartmentData,
      collections: {
        passportPages: {
          deleted: [],
          entity: 'buc_fileCollection',
          items: [],
          key: 'passportPages'
        }
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
