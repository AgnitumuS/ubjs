module.exports = {
  install (Vue) {
    const components = [
      require('../components/controls/UbSelectEntity.vue').default,
      require('../components/controls/UFormRow.vue').default,
      require('../components/controls/UForm'),
      require('../components/controls/UbSelectEnum.vue').default,
      require('../components/UbEntityEdit.vue').default
    ]
    for (const component of components) {
      Vue.component(component.name, component)
    }
  }
}
