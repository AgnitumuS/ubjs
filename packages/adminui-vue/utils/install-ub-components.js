module.exports = {
  install (Vue) {
    // below we export and register each component separately to allow WebStorm IDE correctly recognige registered U* components
    const UFormContainer = require('../components/controls/UFormContainer/UFormContainer') // exports a commonJS
    const USelectEntity = require('../components/controls/USelectEntity.vue').default
    const USelectMany = require('../components/controls/USelectMany.vue').default
    const UFormRow = require('../components/controls/UFormRow.vue').default
    const UUploadDocument = require('../components/controls/UUploadDocument.vue').default
    const UCodeMirror = require('../components/controls/UCodeMirror.vue').default
    const USelectEnum = require('../components/controls/USelectEnum.vue').default
    const UInput = require('../components/controls/UInput/UInput.vue').default
    const UToolbar = require('../components/UToolbar/UToolbar.vue').default
    const UToolbarButton = require('../components/UToolbar/UToolbarButton.vue').default
    const UAutoField = require('../components/UAutoField.vue').default
    const USelectMultiple = require('../components/controls/USelectMultiple.vue').default
    const USelectCollection = require('../components/controls/USelectCollection.vue').default
    const UBaseInput = require('../components/controls/UBaseInput.vue').default
    const UDetailGrid = require('../components/controls/UDetailGrid.vue').default
    Vue.component(UFormContainer.name, UFormContainer)
    Vue.component(USelectEntity.name, USelectEntity)
    Vue.component(USelectMany.name, USelectMany)
    Vue.component(UFormRow.name, UFormRow)
    Vue.component(UUploadDocument.name, UUploadDocument)
    Vue.component(UCodeMirror.name, UCodeMirror)
    Vue.component(USelectEnum.name, USelectEnum)
    Vue.component(UInput.name, UInput)
    Vue.component(UToolbar.name, UToolbar)
    Vue.component(UToolbarButton.name, UToolbarButton)
    Vue.component(UAutoField.name, UAutoField)
    Vue.component(USelectMultiple.name, USelectMultiple)
    Vue.component(USelectCollection.name, USelectCollection)
    Vue.component(UBaseInput.name, UBaseInput)
    Vue.component(UDetailGrid.name, UDetailGrid)

    const HoldFocus = require('../directives/HoldFocus')
    Vue.directive(HoldFocus.name, HoldFocus)

    // dirty hack to retrieve a Clicoutside directive not exposed by Elements
    const Clickoutside = Vue.options.components.ElDropdown.options.directives.Clickoutside
    Vue.directive('Clickoutside', Clickoutside)
  }
}
