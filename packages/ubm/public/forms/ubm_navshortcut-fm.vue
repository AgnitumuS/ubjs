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

      <shortcut-icon-select />

      <u-auto-field
        v-model="displayOrder"
        code="displayOrder"
      />
      <u-form-row label="selectedRights">
        <u-select-multiple
          :value="selectedRights"
          entity-name="uba_subject"
          @input="changeRights"
        />
      </u-form-row>
      <pre>
  {{ this.$store.state.collections.rightsSubjects }}
</pre>
      <el-row>
        <el-col :span="4">
          three
        </el-col>
        <el-col :span="20">
          <!--          <pre>{{ cmdCode }}</pre>-->
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
const { mapGetters, mapMutations, mapActions } = require('vuex')
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

  data () {
    return {
      isPending: false
    }
  },

  computed: {
    ...mapInstanceFields(fieldList),

    ...mapGetters(['entitySchema', 'loading']),

    selectedRights () {
      return this.$store.state.collections.rightsSubjects.items.map(i => i.data.admSubjID)
    }
  },

  created () {
    this.$store.dispatch('loadCollections', ['rightsSubjects'])
  },

  methods: {
    ...mapMutations([ 'REMOVE_COLLECTION_ITEM' ]),

    ...mapActions(['addCollectionItem']),

    getLabel (attr) {
      return this.entitySchema.attributes[attr].caption
    },

    async changeRights (arr, option, isChecked) {
      if (isChecked) {
        if (!this.isPending){
          this.isPending = true
          await this.addCollectionItem({
            collection: 'rightsSubjects',
            execParams: {
              admSubjID: option,
              instanceID: this.$store.state.data.ID
            }
          })
          this.isPending = false
        }
      } else {
        const index = this.selectedRights.indexOf(option)
        if (index !== -1) {
          this.REMOVE_COLLECTION_ITEM({
            collection: 'rightsSubjects',
            index: index
          })
        }
      }
    }
  }
}
</script>
