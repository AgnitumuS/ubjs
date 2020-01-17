<template>
  <div class="u-form-layout">
    <u-toolbar />

    <u-form-container
      v-loading.body="loading"
      label-position="top"
      :max-width="800"
    >
      <u-auto-field
        attribute-name="caption"
        disabled
      />
      <u-auto-field attribute-name="parentAdminUnitID" />
      <u-auto-field attribute-name="code" />
      <u-auto-field attribute-name="regionTypeID" />
      <u-auto-field attribute-name="name" />
      <u-auto-field attribute-name="fullName" />
      <u-auto-field attribute-name="description" />
      <u-auto-field attribute-name="phoneCode" />
      <u-auto-field attribute-name="centerID" />
    </u-form-container>
  </div>
</template>

<script>
const { Form } = require('@unitybase/adminui-vue')
const { mapGetters } = require('vuex')

module.exports.mount = cfg => {
  Form(cfg)
    .processing()
    .validation()
    .mount()
}

module.exports.default = {
  name: 'CdnRegion',

  computed: {
    ...mapGetters(['loading'])
  }
}
</script>
