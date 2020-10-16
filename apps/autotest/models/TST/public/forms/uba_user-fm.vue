<template>
  <parent>
    <div slot="id"></div>
    <div slot="test"></div>
  </parent>
</template>

<script>
const Parent = require('@unitybase/uba/public/forms/uba_user.vue').default

module.exports.mount = function (cfg) {
  Form({
    component: Parent
  })
}

const ExtendRoot = module.exports.default = {
  name: 'ChangedUserForm'
}
</script>
