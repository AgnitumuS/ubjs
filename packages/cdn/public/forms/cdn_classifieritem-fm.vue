<template>
  <div class="u-form-layout">
    <u-toolbar />

    <u-form-container label-position="top">
      <u-auto-field attribute-name="code" />
      <u-auto-field attribute-name="parentID" :repository="getRepo"/>
      <u-auto-field attribute-name="name" />
    </u-form-container>
  </div>
</template>

<script>
const { Form, mapInstanceFields } = require('@unitybase/adminui-vue')
const { required } = require('vuelidate/lib/validators/index')

module.exports.mount = cfg => {
  Form({
    ...cfg,
    modalWidth: '450px'
  })
    .processing({
      inited (store) {
        if (store.state.isNew) {
          store.commit('LOAD_DATA_PARTIAL', { 'classifierID': cfg.parentContext.classifierID })
        }
      }
    })
    .validation()
    .mount()
}

module.exports.default = {
  name: 'CdnClassifierItem',
  inject: ['entity'],

  computed: mapInstanceFields(['code', 'parentID', 'classifierID']),

  methods: {
    getRepo () {
      return this.$UB.Repository(this.entity)
        .attrs('ID', 'code', 'name')
        .where('classifierID', '=', this.classifierID)
        .where('code', '!=', this.code)
    }
  }
}
</script>
