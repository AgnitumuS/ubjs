<template>
  <div class="ub-form-container">
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

      <shortcut-icon-select @select="iconCls = $event" />

      <u-auto-field attribute-name="displayOrder" />

      <u-form-row label="navShortcutRights">
        <u-select-collection
          subject-attr="admSubjID"
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
const ShortcutIconSelect = require('./components/ShortcutIconSelect.vue').default
const ShortcutCmdCode = require('./components/ShortcutCmdCode.vue').default

const { Form, mapInstanceFields } = require('@unitybase/adminui-vue')
const { mapGetters } = require('vuex')
const UB = require('@unitybase/ub-pub')

module.exports.mount = function ({
  title,
  entity,
  instanceID,
  formCode,
  rootComponent,
  parentContext
}) {
  Form({
    component: rootComponent,
    entity,
    instanceID,
    title,
    formCode,
    modalClass: 'ub-dialog__reset-padding'
  })
    .instance()
    .processing({
      inited (store) {
        if (parentContext) store.commit('ASSIGN_DATA', { loadedState: parentContext })
      },
      collections: {
        rightsSubjects: UB.connection
          .Repository('ubm_navshortcut_adm')
          .attrs('ID', 'instanceID', 'admSubjID')
          .where('instanceID', '=', instanceID)
      }
    })
    .validation()
    .mount()
}

module.exports.default = {
  name: 'UbmNavshortcut',
  components: {
    ShortcutTree,
    ShortcutIconSelect,
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
  },
}
</script>
