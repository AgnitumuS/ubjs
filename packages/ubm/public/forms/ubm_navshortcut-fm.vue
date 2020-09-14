<template>
  <div class="u-form-layout">
    <u-toolbar />

    <u-form-container
      v-loading="loading"
      :label-width="160"
    >
      <u-form-row label="ID">
        <el-row
          :gutter="10"
          type="flex"
          align="middle"
          justify="space-between"
        >
          <el-col :span="8">
            <el-input
              readonly
              :value="ID"
            />
          </el-col>

          <el-col
            :span="6"
            :offset="2"
          >
            <el-switch
              v-model="isFolder"
              :active-text="$ut('ubm_navshortcut.isFolder')"
            />
          </el-col>

          <el-col :span="8">
            <el-switch
              v-model="inWindow"
              :active-text="$ut('ubm_navshortcut.inWindow')"
            />
          </el-col>
        </el-row>
      </u-form-row>

      <u-auto-field attribute-name="code" />

      <u-auto-field attribute-name="caption" />

      <shortcut-tree />

      <u-form-row
        :label="iconClsCaption"
      >
        <u-icon-picker
          :value="iconCls"
          :label="iconClsCaption"
          @change="iconCls = $event"
        />
      </u-form-row>

      <u-auto-field attribute-name="displayOrder" />

      <u-form-row label="navShortcutRights">
        <u-select-collection
          associated-attr="admSubjID"
          collection-name="rightsSubjects"
          clearable
        />
      </u-form-row>

      <u-form-row
        v-if="isOrgAdministrationExists"
        label="Shortcut right by staff units"
      >
        <u-select-collection
          associated-attr="orgUnitID"
          collection-name="rightsOrgUnits"
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
  const { entities } = UB.connection.domain
  const isOrgAdministrationExists = entities.org_navshortcut_adm !== undefined

  Form({
    ...cfg,
    modalClass: 'ub-dialog__reset-padding',
    props: {
      isOrgAdministrationExists
    }
  })
    .processing({
      inited (store) {
        if (cfg.parentContext) {
          store.commit('ASSIGN_DATA', { loadedState: cfg.parentContext })
        }
      },
      collections: {
        rightsSubjects: ({ state }) => UB.connection
          .Repository('ubm_navshortcut_adm')
          .attrs('ID', 'instanceID', 'admSubjID')
          .where('instanceID', '=', state.data.ID),

        ...(isOrgAdministrationExists
          ? {
            rightsOrgUnits: ({ state }) => UB.connection
              .Repository('org_navshortcut_adm')
              .attrs('ID', 'instanceID', 'orgUnitID')
              .where('instanceID', '=', state.data.ID)
          }
          : {})
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

  props: {
    isOrgAdministrationExists: {
      type: Boolean,
      required: true
    }
  },

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

    ...mapGetters(['loading']),

    iconClsCaption () {
      return this.entitySchema.attributes.iconCls.caption
    }
  }
}
</script>
