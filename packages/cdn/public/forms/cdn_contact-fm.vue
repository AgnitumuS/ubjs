<template>
  <div class="u-form-layout">
    <u-toolbar />

    <u-form-container label-position="top">
      <u-auto-field attribute-name="contactTypeID" />
      <u-auto-field attribute-name="value" />
    </u-form-container>
  </div>
</template>

<script>
/* global UB */
const { Form } = require('@unitybase/adminui-vue')
const { required } = require('vuelidate/lib/validators/index')

module.exports.mount = cfg => {
  Form({
    ...cfg,
    modalWidth: '450px'
  })
    .processing({
      inited (store) {
        if (cfg.parentContext && cfg.parentContext.subjectID) {
          store.commit('LOAD_DATA_PARTIAL', {
            subjectID: cfg.parentContext.subjectID
          })
        }
      },
      async beforeSave (store) {
        const { subjectID } = cfg.parentContext
        const { contactTypeID } = store.state.data
        const type = await UB.Repository('cdn_contacttype')
          .attrs(['code'])
          .where('ID', '=', contactTypeID)
          .selectAsObject()
        if (type && type[0].code !== 'actualAddr') return true
        const data = await UB.Repository('cdn_contact')
          .attrs(['ID', 'subjectID', 'contactTypeID'])
          .where('subjectID', '=', subjectID)
          .where('contactTypeID', '=', contactTypeID)
          .selectAsObject()
        if (data.length === 0 || (data.length > 0 && !store.state.isNew)) {
          store.commit('SET_DATA', { key: 'canAddData', value: true })
        }
        return true
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
  name: 'CdnContact'
}
</script>
