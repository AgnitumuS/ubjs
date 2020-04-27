const _ = require('lodash')
const localVue = require('vue')
localVue.component('aaa', {})
if (typeof window.Vue.options.components.aaa !== 'function') throw new Error('Fake vue component must exists in global Vue')
if (typeof localVue.options.components.aaa !== 'function') throw new Error('Fake vue component must exists in local Vue')
require('./src/test-module.js')

$App.on('applicationReady', () => {
  $App.doCommand({
    cmdType: 'showForm',
    entity: 'tst_dictionary'
  })
})
