<template>
  <div
    v-loading="loading"
    class="u-form-layout"
  >
    <u-toolbar />

    <u-form-container
      label-position="top"
      :is-disabled="true"
    >
      <u-grid :columns="4">
        <u-auto-field attribute-name="messageType" />
        <u-auto-field attribute-name="startDate" />
        <u-auto-field attribute-name="expireDate" />
        <u-auto-field attribute-name="complete" />
      </u-grid>
      <u-auto-field attribute-name="messageBody" />
      <u-field-set
        :expandable="false"
        title="ubs_message_recipient"
        title-align="center"
      >
        <u-table-entity
          :repository="recipientsRepository"
          :hide-actions="['addNew', 'copy', 'newVersion', 'showVersions', 'edit', 'delete']"
        />
      </u-field-set>
    </u-form-container>
  </div>
</template>

<script>
const { Form, mapInstanceFields } = require('@unitybase/adminui-vue')
const { mapGetters, mapState } = require('vuex')
const UB = require('@unitybase/ub-pub')

module.exports.mount = function (cfg) {
  Form(cfg)
    .processing()
    .validation()
    .mount()
}

module.exports.default = {
  name: 'ubs_message_view',
  inject: ['$v', 'entitySchema'],
  computed: {
    ...mapInstanceFields(['ID'/* add fields here */]),
    ...mapGetters(['loading']),
    ...mapState(['isNew'])
  },
  methods: {
    recipientsRepository () {
      return this.$UB.Repository('ubs_message_recipient')
        .attrs('ID', 'userID.name', 'acceptDate')
        .where('messageID', '=', this.ID)
    }
  }
}
</script>
