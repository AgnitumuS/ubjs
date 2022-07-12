<template>
  <div
    v-loading="loading"
    class="u-form-layout"
  >
    <u-toolbar />

    <u-form-container label-position="top">
      <u-auto-field attribute-name="parentID" :readonly="true" />
      <u-auto-field attribute-name="unitType" :disabled="true" />
      <u-auto-field attribute-name="code" :disabled="true" />
      <u-auto-field attribute-name="caption" :disabled="true" />
    </u-form-container>
  </div>
</template>

<script>
const { Form, mapInstanceFields } = require('@unitybase/adminui-vue')
const { mapGetters } = require('vuex')

module.exports.mount = cfg => {
  Form(cfg)
    .processing()
    .validation()
    .mount()
}

module.exports.default = {
  name: 'org_unit',
  computed: {
    ...mapInstanceFields([
      'ID',
      'parentID',
      'unitType',
      'code',
      'caption'
    ]),
    ...mapGetters(['loading'])
  }
}
</script>
