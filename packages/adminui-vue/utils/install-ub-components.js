module.exports = {
  install (Vue) {
    const components = [
      require('../components/controls/USelectEntity.vue').default,
      require('../components/controls/USelectMany.vue').default,
      require('../components/controls/UFormRow.vue').default,
      require('../components/controls/UUploadDocument.vue').default,
      require('../components/controls/UCodeMirror.vue').default,
      require('../components/controls/UForm/index.js'),
      require('../components/controls/USelectEnum.vue').default,
      require('../components/controls/UInput/index.vue').default,
      require('../components/UToolbar/index.vue').default
    ]
    for (const component of components) {
      Vue.component(component.name, component)
    }
    const directives = [
      require('../directives/HoldFocus.js')
    ]
    for (const directive of directives) {
      Vue.directive(directive.name, directive)
    }
  }
}
