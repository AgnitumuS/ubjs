<template>
  <div class="u-form-layout">
    <u-toolbar />

    <u-form-container
      v-loading.body="loading"
      label-position="top"
      :max-width="800"
    >
      <u-auto-field attribute-name="parentID" />
      <u-auto-field attribute-name="code" />
      <u-auto-field attribute-name="name" />
      <u-auto-field attribute-name="nameGen" />
      <u-auto-field attribute-name="nameDat" />

      <u-form-row :label="`${entity}member.orgUnitID`">
        <u-select-collection
          associated-attr="orgUnitID"
          entity-name="org_execgroupmember"
          collection-name="groupmembers"
          clearable
        />
      </u-form-row>
    </u-form-container>
  </div>
</template>

<script>
const UB = require('@unitybase/ub-pub')
const { Form, mapInstanceFields } = require('@unitybase/adminui-vue')
const { mapGetters } = require('vuex')

module.exports.mount = cfg => {
  Form(cfg)
    .processing({
      collections: {
        groupmembers: ({ state }) => UB.Repository('org_execgroupmember')
          .attrs('ID', 'execGroupID', 'orgUnitID')
          .where('execGroupID', '=', state.data.ID)
      }
    })
    .validation()
    .mount()
}

module.exports.default = {
  name: 'OrgExecGroup',

  inject: ['entity'],

  computed: {
    ...mapInstanceFields(['ID', 'parentID', 'code', 'name', 'nameGen', 'nameDat']),
    ...mapGetters(['loading'])
  }
}
</script>
