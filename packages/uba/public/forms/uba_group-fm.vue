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
      >
        <u-table-entity
          :bordered="true"
          :repository="getUsersRepository"
          :style="{maxWidth: '800px'}"
          :build-add-new-config="userGroupConfig"
          :build-copy-config="userGroupConfig"
          :build-edit-config="userGroupConfig"
        />
      </u-form-row>

    </u-form-container>
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
          .where('groupID', '=', state.data.ID)
      }
    })
    .validation()
    .mount()
}

module.exports.default = {
  name: 'UbaGroup',

  computed: {
    ...mapState(['isNew']),

    ...mapGetters(['loading']),

    instanceID () {
      return this.$store.state.data.ID
    }
  },

  methods: {
    ...mapActions(['save']),

    getUsersRepository () {
      return Repository('uba_usergroup')
        .attrs('userID.name')
        .where('groupID', '=', this.instanceID)
    },

    userGroupConfig (cfg) {
      if (this.isNew) {
        this.save()
      }

      return {
        ...cfg,
        isModal: true,
        modalWidth: '800px',
        props: {
          parentContext: {
            groupID: this.instanceID
          }
        }
      }
    }
  }

}
</script>
