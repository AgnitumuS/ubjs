import Vue from 'vue'
import UB from '@unitybase/ub-pub'
import Vuex from 'vuex'
import Element from 'element-ui'
import 'font-awesome/css/font-awesome.css'
import '../dist/adminui-vue.css'
import locale from 'element-ui/lib/locale/lang/en'

Vue.use(Element, {
  size: 'small',
  locale
})
Vue.use(Vuex)
Vue.use(UB)
window.UB = UB

if ('serviceWorker' in navigator) {
  console.log('CLIENT: service worker registration in progress.')
  navigator.serviceWorker.register('/service-worker.js').then(function () {
    console.log('CLIENT: service worker registration complete.')
  }, function () {
    console.log('CLIENT: service worker registration failure.')
  })
} else {
  console.log('CLIENT: service worker is not supported.')
}

UB.connect({
  host: 'http://localhost:8080',
  path: '',
  onCredentialRequired: false,
  allowSessionPersistent: false,
  onAuthorized: function (conn) {},
  onAuthorizationFail: function (reason, conn) {},
  onNeedChangePassword: null,
  onGotApplicationConfig: function (/** @type {UBConnection} */ connection) {
    _.defaultsDeep(connection.appConfig, {
      comboPageSize: 30,
      maxMainWindowTabOpened: 40,
      storeDefaultPageSize: 100,
      gridHeightDefault: 400,
      gridWidthDefault: 600,
      gridParentChangeEventTimeout: 200,
      gridDefaultDetailViewHeight: 150,
      formMinHeight: 100,
      formMinWidth: 300,
      formDefaultAutoFormWidth: 300,
      formSaveMaskDelay: 100,
      scanRecognizeProgressInterval: 1000,
      maxSearchLength: 62,
      uiSettings: {
        adminUI: {
          defaultPasswordForDebugOnly: ''
        }
      }
    })
    UB.appConfig = connection.appConfig
    return null
  }
}).then(() => {
  UB.core.UBApp = {
    doCommand: console.log
  }
  UB.core.UBCommand = {
    commandType: {
      showForm: 'showForm',
      showList: 'showList'
    }
  }
  UB.ux.data = {
    UBStore: {
      normalizeFieldList (entityName, fieldList) {
        let entity
        if (typeof (entityName) === 'string') {
          entity = UB.connection.domain.get(entityName)
        } else {
          entity = entityName
        }

        if (!entity) {
          throw new Error(`Entity "${entityName}" doesn't exists in domain`)
        }
        let hasID = false
        let hasMD = false
        let result = []
        fieldList.forEach(function (field) {
          result.push(field)
          hasID = hasID || field === 'ID' || field.name === 'ID'
          hasMD = hasMD || field === 'mi_modifyDate' || field.name === 'mi_modifyDate'
        })
        if (!hasID) {
          result.push('ID')
        }
        let mStorage = entity.mixins.mStorage
        if (mStorage && mStorage.simpleAudit && !hasMD) {
          result.push('mi_modifyDate')
        }
        return result
      }
    }
  }
  window.$App = {
    viewport: {
      centralPanel: {
        queryById () {
          return {
            close: console.log('closeTab'),
            on: console.log('onTab')
          }
        }
      }
    }
  }

  window.BOUNDLED_BY_WEBPACK = true
})
