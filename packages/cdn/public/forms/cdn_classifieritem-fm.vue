<template>
  <div class="u-form-layout">
    <u-toolbar />

    <u-form-container label-position="top">
      <u-auto-field attribute-name="code" />
      <u-form-row :label="`${entity}.parentID`">
        <u-select-entity
          v-model="parentID"
          :repository="getRepo"
        />
      </u-form-row>
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
    .validation({
      validations () {
        return {
          code: { required },
          name: { required }
        }
      }
    })
    .mount()
}

module.exports.default = {
  name: 'CdnClassifierItem',
  inject: ['entity'],

  computed: mapInstanceFields(['code', 'parentID']),

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
