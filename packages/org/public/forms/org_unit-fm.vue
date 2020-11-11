<template>
  <div class="u-form-layout">
    <u-toolbar />

    <u-form-container label-position="top">
      <u-auto-field
        readonly
        attribute-name="parentID"
      />
      <u-auto-field
        readonly
        attribute-name="unitType"
      />
      <u-auto-field
        readonly
        attribute-name="code"
      />
      <u-auto-field
        disabled
        attribute-name="caption"
      />
    </u-form-container>
  </div>
</template>

<script>
const { Form, mapInstanceFields } = require('@unitybase/adminui-vue')

module.exports.mount = cfg => {
  Form(cfg)
    .processing()
    .validation()
    .mount()
}

module.exports.default = {
  name: 'org_unit',
  computed: {
    ...mapInstanceFields(['ID', 'parentID', 'unitType', 'code', 'caption'])
  }
}
</script>
