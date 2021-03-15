<template>
  <div class="u-form-layout">
    <u-toolbar />

    <u-form-container
      v-loading="loading"
      label-position="top"
    >
      <u-grid columns="4">
        <u-auto-field attribute-name="code" />
        <u-auto-field attribute-name="isFolder" force-cmp="el-switch" />
        <u-auto-field attribute-name="inWindow" force-cmp="el-switch" />
        <u-auto-field attribute-name="ID" label="ID" readonly />
      </u-grid>
      <u-auto-field attribute-name="caption" />
      <u-grid columns="3">
        <shortcut-tree />
        <u-form-row
          :label="entitySchema.attributes.iconCls.caption"
        >
          <u-icon-picker
            :value="iconCls"
            @change="iconCls = $event"
          />
        </u-form-row>
        <u-auto-field attribute-name="displayOrder" />
      </u-grid>

      <u-form-row label="navShortcutRights">
        <u-select-collection
          associated-attr="admSubjID"
          collection-name="rightsSubjects"
          clearable
        />
      </u-form-row>
      <shortcut-cmd-code />
    </u-form-container>
  </div>
</template>

<script>
const ShortcutTree = require('./components/ShortcutTree.vue').default
const ShortcutCmdCode = require('./components/ShortcutCmdCode.vue').default

const { Form, mapInstanceFields } = require('@unitybase/adminui-vue')
const { mapGetters } = require('vuex')
const UB = require('@unitybase/ub-pub')

module.exports.mount = function (cfg) {
  Form({
    ...cfg,
    modalClass: 'ub-dialog__reset-padding'
  })
    .processing({
      inited (store) {
        if (cfg.parentContext) store.commit('ASSIGN_DATA', { loadedState: cfg.parentContext })
      },
      collections: {
        rightsSubjects: ({ state }) => UB.connection.Repository('ubm_navshortcut_adm')
          .attrs('ID', 'instanceID', 'admSubjID')
          .where('instanceID', '=', state.data.ID)
      }
    })
    .validation()
    .mount()
}

module.exports.default = {
  name: 'UbmNavshortcut',
  components: {
    ShortcutTree,
    ShortcutCmdCode
  },
  inject: ['entitySchema'],

  data () {
    return {
      mainHeight: null // get form height after mount
    }
  },

  computed: {
    ...mapInstanceFields([
      'ID',
      'desktopID',
      'parentID',
      'isFolder',
      'cmdCode',
      'inWindow',
      'iconCls'
    ]),

    ...mapGetters(['loading'])
  }
}
</script>
