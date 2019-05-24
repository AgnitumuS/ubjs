<template>
  <div class="ub-form-container">
    <u-toolbar :validation="$v" />

    <u-form
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

      <u-form-row label="selectedRights">
        <u-select-collection
          subject-attr="admSubjID"
          collection-name="rightsSubjects"
          clearable
        />
      </u-form-row>

      <el-row>
        <el-col :span="5">
          <el-tree
            ref="tree"
            :data="cmdCodeAttrs"
            default-expand-all
            :expand-on-click-node="false"
            @node-click="selectNode"
          />
        </el-col>
        <el-col :span="19">
          <u-code-mirror v-model="cmdCode" />
        </el-col>
      </el-row>
    </u-form>
  </div>
</template>

<script>
const ShortcutTree = require('./components/ShortcutTree.vue').default
const ShortcutIconSelect = require('./components/ShortcutIconSelect.vue').default

const { formBoilerplate, mapInstanceFields } = require('@unitybase/adminui-vue')
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

module.exports.mount = function (params) {
  const masterRequest = UB.connection
    .Repository(params.entity)
    .attrs(fieldList)

  const collectionRequests = {
    rightsSubjects: UB.connection
      .Repository('ubm_navshortcut_adm')
      .attrs('ID', 'instanceID', 'admSubjID')
      .where('instanceID', '=', params.instanceID)
  }

  params.title = 'Shortcut edit' // temp
  params.isModal = true
  params.modalClass = 'ub-dialog__reset-padding'

  formBoilerplate({
    params,
    FormComponent: UbmNavshortcut,
    masterRequest,
    collectionRequests
  })
}

const UbmNavshortcut = module.exports.default = {
  name: 'UbmNavshortcut',
  components: {
    ShortcutTree,
    ShortcutIconSelect
  },

  computed: {
    ...mapInstanceFields(fieldList),

    ...mapGetters(['entitySchema', 'loading']),

    cmdCodeName () {
      return 'uba_user'
    },

    cmdCodeEntitySchema () {
      return this.$UB.connection.domain.get(this.cmdCodeName)
    },

    cmdCodeAttrs () {
      console.log(this.cmdCodeEntitySchema)
      return [{
        label: 'Level one 1',
        children: [{
          label: 'Level two 1-1',
          children: [{
            label: 'Level three 1-1-1'
          }]
        }]
      }]
    }
  },

  methods: {
    getLabel (attr) {
      return this.entitySchema.attributes[attr].caption
    },

    selectNode (node) {
      console.log(node)
    }
  }
}
</script>
