<template>
  <form-root>
    <div slot="test" />
    <div
      slot="test2"
      slot-scope="{value}"
    >
      {{ value }} Рш
    </div>
  </form-root>
</template>

<script>
/* TODO: prevent boolean fields required values */

const { Form } = require('@unitybase/adminui-vue')
const {
  entityName: certificateEntity,
  fieldList: certificateFieldList
} = require('./uba_user/certificateCollectionDefinition')

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
        certificates: ({ state }) => UB.Repository(certificateEntity)
          .attrs(certificateFieldList)
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
  },

  mixins: [
    require('./uba_user/formCaptionMixin')
  ],
}
</script>
