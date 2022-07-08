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
          :columns="columns"
        />
      </u-form-row>

    </u-form-container>
  </div>
</template>

<script>
const { Form } = require('@unitybase/adminui-vue')
const { Repository } = require('@unitybase/ub-pub')
const { mapGetters } = require('vuex')

module.exports.mount = (cfg) => {
  Form(cfg)
    .store()
    .processing({
      collections: {
        groupRoles: ({ state }) => Repository('uba_grouprole')
          .attrs('ID', 'groupID', 'roleID')
          .where('groupID', '=', state.data.ID)
      }
    })
    .mount()
}

module.exports.default = {
  name: 'UbaGroup',

  computed: {
    ...mapGetters(['loading']),
    instanceID () {
      return this.$store.state.data.ID
    },

    columns () {
      return [{ id: 'userID.name', label: '' }]
    }
  },

  methods: {
    getUsersRepository () {
      return Repository('uba_usergroup').attrs('userID.name').where('groupID', '=', this.instanceID)
    }
  }

}
</script>
