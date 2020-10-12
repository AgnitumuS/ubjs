<template>
  <form-root />
</template>

<script>
const { Form } = require('@unitybase/adminui-vue')

module.exports.mount = cfg => {
  // uba_userrole
  // uba_usergroup
  // uba_usercertificate
  Form(cfg)
    .processing({
      masterFieldList: [
        'firstName',
        'name',
        'lastName',
        'fullName',
        'gender',
        'email',
        'phone',
        'description',
        'disabled',
        'isPending',
        'trustedIP',
        'uData',
        'avatar'
      ]
    })
    .validation()
    .mount()
}

module.exports.default = {
  name: 'UserForm',
  components: {
    FormRoot: require('./uba_user/FormRoot.vue').default
  }
}
</script>
