const _ = require('lodash')
const localVue = require('vue')
localVue.component('aaa', {})
if (typeof window.Vue.options.components.aaa !== 'function') throw new Error('Fake vue component must exists in global Vue')
if (typeof localVue.options.components.aaa !== 'function') throw new Error('Fake vue component must exists in local Vue')
require('./src/test-module.js')

// hack to increase a global HTTP timeout
// const transport = require('@unitybase/ub-pub/transport')
// transport.xhrDefaults.timeout = 300000 // 5 minutes

// if ($App) {
//   $App.on('applicationReady', () => {
//     $App.doCommand({
//       cmdType: 'showForm',
//       entity: 'tst_dictionary',
//       instanceID: 1
//     })
//   })
// }

const TST = UB.ns('TST')
TST.addGridActions = function (createElement) {
  return {
    toolbarPrepend: ({ store, close }) => {
      return createElement('u-button', {
        props: {
          appearance: 'inverse',
          icon: 'el-icon-document-remove'
        },
        on: {
          click: async function () { // this === window!
            await $App.dialogInfo('Action fired')
            return
          }
        }
      }, ['ActionTest'])
    }
  }
}
