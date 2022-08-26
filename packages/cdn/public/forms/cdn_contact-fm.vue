<template>
  <div class="u-form-layout">
    <u-toolbar/>

    <u-form-container label-position="top">
      <u-auto-field attribute-name="contactTypeID"/>
      <u-auto-field attribute-name="value"/>
      <u-auto-field attribute-name="subjectID" v-if="!subjectID"/>
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
        if (cfg.parentContext?.subjectID) {
          store.commit('LOAD_DATA_PARTIAL', { subjectID: cfg.parentContext.subjectID })
        }
      }
    })
    .validation({
      validations () {
        return {
          contactTypeID: { required },
          value: { required }
        }
      }
    })
    .mount()
}

module.exports.default = {
  name: 'CdnContact',

  computed: {
    ...mapInstanceFields(['subjectID'])
  }
}
</script>
