<template>
  <div class="ub-form-container">
    <u-toolbar />

    <u-form-container
      v-loading="loading"
      :label-width="160"
    >
      <el-tabs @tab-click="setCodeCmdHeight">
        <el-tab-pane
          ref="main"
          :label="$ut('main')"
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
                  :active-text="getLabel('isFolder')"
                />
              </el-col>

              <el-col :span="8">
                <el-switch
                  v-model="inWindow"
                  :active-text="getLabel('inWindow')"
                />
              </el-col>
            </el-row>
          </u-form-row>

          <u-auto-field
            v-model="code"
            code="code"
          />

          <u-auto-field
            v-model="caption"
            code="caption"
          />

          <shortcut-tree />

          <shortcut-icon-select @select="iconCls = $event" />

          <u-auto-field
            v-model="displayOrder"
            code="displayOrder"
          />

          <u-form-row label="navShortcutRights">
            <u-select-collection
              subject-attr="admSubjID"
              collection-name="rightsSubjects"
              clearable
            />
          </u-form-row>
        </el-tab-pane>

        <el-tab-pane
          ref="cmdCode"
          :label="getLabel('cmdCode')"
          lazy
        >
          <shortcut-cmd-code />
        </el-tab-pane>
      </el-tabs>
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

const fieldList = [
  'ID',
  'desktopID',
  'parentID',
  'code',
  'isFolder',
  'caption',
  'cmdCode',
  'inWindow',
  'displayOrder',
  'iconCls'
]

module.exports.mount = function ({
  title,
  entity,
  instanceID,
  formCode,
  rootComponent,
  isFolder,
  desktopID,
  parentID
}) {
  Form({
    component: rootComponent,
    entity,
    instanceID,
    title,
    formCode,
    isModal: true,
    modalClass: 'ub-dialog__reset-padding'
  })
    .instance()
    .processing({
      inited (store) {
        if (isFolder) {
          store.commit('SET_DATA', { key: 'isFolder', value: isFolder })
        }
        if (desktopID) {
          store.commit('SET_DATA', { key: 'desktopID', value: desktopID })
        }
        if (parentID) {
          store.commit('SET_DATA', { key: 'parentID', value: parentID })
        }
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
    ...mapInstanceFields(fieldList),
    ...mapGetters(['loading'])
  },

  methods: {
    getLabel (attr) {
      return this.entitySchema.attributes[attr].caption
    },

    // on tab change set height to cmdCode pane
    async setCodeCmdHeight () {
      await this.$nextTick()
      if (this.$refs.cmdCode.$el) {
        this.$refs.cmdCode.$el.style.height = this.mainHeight + 'px'
      }
    }
  },

  async mounted () {
    await this.$nextTick()
    this.mainHeight = this.$refs.main.$el.offsetHeight
  }
}
</script>
