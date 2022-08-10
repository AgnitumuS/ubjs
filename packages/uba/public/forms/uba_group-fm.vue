<template>
  <div
    v-loading="loading"
    class="u-form-layout"
  >
    <u-toolbar/>

    <u-form-container
      label-position="top"
      :max-width="800"
    >

      <u-auto-field attribute-name="code" required/>
      <u-auto-field attribute-name="name" required/>
      <u-auto-field attribute-name="description"/>

      <u-form-row
        :label="$ut('roles')"
      >
        <u-select-collection
          associated-attr="roleID"
          entity-name="uba_grouprole"
          collection-name="groupRoles"
          clearable
        />
      </u-form-row>

      <u-form-row
        :label="$ut('users')"
        preventLabelEvents
      >
        <u-table-entity
          :bordered="true"
          :repository="getUsersRepository"
          :style="{maxWidth: '800px'}"
          :before-add-new="showPopUpToAddUsers"
          enable-multi-select
        >
        </u-table-entity>
      </u-form-row>

    </u-form-container>

    <users-select-dialog
      ref="usersSelectDialog"
      :title="dialogTitle"
      :instanceID="instanceID"
    />
  </div>
</template>

<script>
const { Form } = require('@unitybase/adminui-vue')
const { Repository } = require('@unitybase/ub-pub')
const { mapGetters, mapActions, mapState } = require('vuex')

module.exports.mount = (cfg) => {
  Form({
    ...cfg,
    title: '{code} {name}'
  })
    .store()
    .processing({
      collections: {
        groupRoles: ({ state }) => Repository('uba_grouprole')
          .attrs('ID', 'groupID', 'roleID')
          .where('groupID', '=', state.data.ID),

        groupUsers: ({ state }) => Repository('uba_usergroup')
          .attrs('ID', 'groupID', 'userID')
          .where('groupID', '=', state.data.ID)
      }
    })
    .validation()
    .mount()
}

module.exports.default = {
  name: 'UbaGroup',

  components: {
    UsersSelectDialog: require('./uba_group/users-select-dialog.vue').default
  },

  computed: {
    ...mapState(['isNew']),

    ...mapGetters(['loading']),

    instanceID () {
      return this.$store.state.data.ID
    },

    dialogTitle () {
      return `${this.$ut('uba_usergroup')} (${this.$ut('dobavlenie')})`
    }
  },

  methods: {
    ...mapActions(['save']),

    getUsersRepository () {
      return Repository('uba_usergroup')
        .attrs('userID.name')
        .where('groupID', '=', this.instanceID)
    },

    async showPopUpToAddUsers () {
      this.$refs.usersSelectDialog.open()
      return false
    }
  }

}
</script>
