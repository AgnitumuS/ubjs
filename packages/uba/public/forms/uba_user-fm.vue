<template>
  <uba-user-root />
</template>

<script>
const { Form } = require('@unitybase/adminui-vue')
const {
  entityName: certificateEntity,
  fieldList: certificateFieldList
} = require('./uba_user/certificateCollectionDefinition')

module.exports.controller = cfg => {
  return Form(cfg)
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
        certificates: ({ state }) => UB.Repository(certificateEntity)
          .attrs(certificateFieldList)
          .where('userID', '=', state.data.ID)
      }
    })
    .validation()
}

module.exports.default = {
  name: 'UserForm',
  components: {
    UbaUserRoot: require('./uba_user/UbaUserRoot.vue').default
  },

  mixins: [
    require('./uba_user/formCaptionMixin')
  ]
}
</script>
