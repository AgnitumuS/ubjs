<template>
  <form-root />
</template>

<script>
const { Form } = require('@unitybase/adminui-vue')

module.exports.mount = cfg => {
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
      ],

      collections: {
        roles: ({ state }) => UB.Repository('uba_userrole')
          .attrs('ID', 'roleID', 'userID')
          .where('userID', '=', state.data.ID),
        groups: ({ state }) => UB.Repository('uba_usergroup')
          .attrs('ID', 'groupID', 'userID')
          .where('userID', '=', state.data.ID),
        certificates: ({ state }) => UB.Repository('uba_usercertificate')
          .attrs('issuer_serial', 'serial', 'description', 'disabled', 'revoked', 'ID', 'userID')
          .where('userID', '=', state.data.ID)

      }
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
