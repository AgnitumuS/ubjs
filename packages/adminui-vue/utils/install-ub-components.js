module.exports = {
  install (Vue) {
    const components = [
      require('../components/controls/UbSelectEntity.vue').default,
      require('../components/controls/UbSelectMany.vue').default,
      require('../components/controls/UFormRow.vue').default,
      require('../components/controls/UbUploadDocument.vue').default,
      require('../components/controls/UCodeMirror.vue').default,
      require('../components/controls/UInputNumber.vue').default,
      require('../components/controls/UForm'),
      require('../components/controls/UbSelectEnum.vue').default,
      require('../components/controls/UInput.vue').default,
      require('../components/UEntityEdit.vue').default
    ]
    for (const component of components) {
      Vue.component(component.name, component)
    }
  }
}
