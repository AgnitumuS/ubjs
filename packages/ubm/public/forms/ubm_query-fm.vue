<template>
  <div class="u-form-layout">
    <u-toolbar />

    <u-form-container label-position="top">
      <u-auto-field attribute-name="code" disabled />
      <u-auto-field attribute-name="name" disabled />
      <u-auto-field attribute-name="type" disabled />
      <u-auto-field attribute-name="ubql" read-only />
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
  name: 'ubm_query',
  computed: mapInstanceFields(['ID', 'code', 'name', 'ubql', 'type'])
}
</script>
