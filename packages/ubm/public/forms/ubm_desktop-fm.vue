<template>
  <div
    v-loading="loading"
    class="u-form-layout"
  >
    <u-toolbar />

    <u-form-container
      label-position="top"
      :max-width="800"
    >
      <u-auto-field attribute-name="code" />
      <u-auto-field attribute-name="caption" />
      <u-auto-field attribute-name="description" />
      <u-auto-field attribute-name="isDefault" />

      <u-form-row
        label="ubm_desktop.iconCls"
        required
      >
        <u-icon-picker
          :value="iconCls"
          label="ubm_desktop.iconCls"
          @change="iconCls = $event"
        />
      </u-form-row>

      <u-auto-field attribute-name="displayOrder" />

      <u-form-row label="Desktop rights">
        <u-select-collection
          associated-attr="admSubjID"
          collection-name="rightsSubjects"
          clearable
        />
      </u-form-row>
    </u-form-container>
  </div>
</template>

<script>
const { Form, mapInstanceFields } = require('@unitybase/adminui-vue')
const { mapGetters } = require('vuex')
const UB = require('@unitybase/ub-pub')

module.exports.mount = cfg => {
  Form(cfg)
    .processing({
      collections: {
        rightsSubjects: ({ state }) => UB.connection
          .Repository('ubm_desktop_adm')
          .attrs('ID', 'instanceID', 'admSubjID')
          .where('instanceID', '=', state.data.ID)
      }
    })
    .validation()
    .mount()
}

export default {
  name: 'UbmDesktopForm',

  computed: {
    ...mapInstanceFields([
      'iconCls'
    ]),

    ...mapGetters([
      'loading'
    ])
  }
}
</script>
