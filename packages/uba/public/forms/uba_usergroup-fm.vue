<template>
  <div class="u-form-layout">
    <u-toolbar/>
    <u-form-container
      label-position="top"
      :max-width="800"
    >
      <u-auto-field attribute-name="userID" required/>
      <u-auto-field attribute-name="groupID" required/>
    </u-form-container>
  </div>
</template>

<script>
const { Form } = require('@unitybase/adminui-vue')

module.exports.mount = (cfg) => {
  Form(cfg)
    .store()
    .processing()
    .validation()
    .mount()
}

module.exports.default = {
  name: 'UbaUsergroup'
}
</script>
