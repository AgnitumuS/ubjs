<template>
  <div class="u-form-layout">
    <u-toolbar />

    <u-form-container
      v-loading="loading"
      label-position="top"
    >
      <u-grid :columns="3">
        <u-auto-field attribute-name="code" />
        <span>
          <u-auto-field
            attribute-name="isFolder"
            force-cmp="el-switch"
            style="display: inline-block"
          />
          <u-auto-field
            attribute-name="inWindow"
            force-cmp="el-switch"
            style="display: inline-block"
          />
        </span>
        <u-form-row label="ID">
          {{ ID }}
        </u-form-row>
        <u-auto-field
          attribute-name="caption"
          style="grid-column-start: 1; grid-column-end: 4"
        />

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

        <u-acl-rls-input
          style="grid-column-start: 1; grid-column-end: 4"
        />
      </u-grid>

      <shortcut-cmd-code />
    </u-form-container>
  </div>
</template>

<script>
const { Form, mapInstanceFields } = require('@unitybase/adminui-vue')
const { mapGetters } = require('vuex')
const { connection, Repository } = require('@unitybase/ub-pub')

module.exports.mount = cfg => {
  Form({
    ...cfg,
    modalClass: 'ub-dialog__reset-padding'
  })
    .processing({
      inited (store) {
        if (cfg.parentContext) {
          store.commit('ASSIGN_DATA', { loadedState: cfg.parentContext })
        }
      },
      collections: {
        aclRlsEntries: ({ state }) => {
          // select all fields ('*' is not allowed on client) in order to display them in UAclRlsInput (view its docs)
          const attributes = Object.keys(connection.domain.entities.ubm_navshortcut_acl.attributes)

          return Repository('ubm_navshortcut_acl')
            .attrs(attributes)
            .where('instanceID', '=', state.data.ID)
        }
      }
    })
    .validation()
    .mount()
}

export default {
  name: 'UbmNavshortcut',

  components: {
    ShortcutTree: require('./components/ShortcutTree.vue').default,
    ShortcutCmdCode: require('./components/ShortcutCmdCode.vue').default
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
