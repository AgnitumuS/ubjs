module.exports = {
  install (Vue) {
    const components = [
      require('../components/controls/USelectEntity.vue').default,
      require('../components/controls/USelectMany.vue').default,
      require('../components/controls/UFormRow.vue').default,
      require('../components/controls/UUploadDocument.vue').default,
      require('../components/controls/UCodeMirror.vue').default,
      require('../components/controls/UInputNumber.vue').default,
      require('../components/controls/UForm/index.js'),
      require('../components/controls/USelectEnum.vue').default,
      require('../components/controls/UInput.vue').default,
      require('../components/UEntityEdit.vue').default
    ]
    for (const component of components) {
      Vue.component(component.name, component)
    }
  }
}
