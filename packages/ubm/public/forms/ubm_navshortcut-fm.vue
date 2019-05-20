<template>
  <div class="ub-form-container">
    <u-toolbar :validation="$v" />

    <u-form
      v-loading.body="loading"
      :label-width="160"
    >
      <u-form-row
        label="ID"
      >
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

          <el-col :span="6" :offset="2">
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

      <!--<u-auto-field-->
        <!--v-model="desktopID"-->
        <!--code="desktopID"-->
      <!--/>-->

      <!--<u-auto-field-->
        <!--v-model="parentID"-->
        <!--code="parentID"-->
      <!--/>-->

      <u-auto-field
        v-model="iconCls"
        code="iconCls"
      />

      <u-auto-field
        v-model="displayOrder"
        code="displayOrder"
      />

      <el-row>
        <el-col :span="4">
          three
        </el-col>
        <el-col :span="20">
          <u-code-mirror v-model="cmdCode" />
        </el-col>
      </el-row>
    </u-form>
  </div>
</template>

<script>
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

  params.title = 'Shortcut edit' // temp
  params.isModal = true
  params.modalClass = 'ub-dialog__reset-padding'

  formBoilerplate({
    params,
    FormComponent: UbmNavshortcut,
    masterRequest
  })
}

const UbmNavshortcut = module.exports.default = {
  name: 'UbmNavshortcut',

  computed: {
    ...mapInstanceFields(fieldList),

    ...mapGetters(['entitySchema', 'loading'])
  },

  methods: {
    getLabel (attr) {
      return this.entitySchema.attributes[attr].caption
    }
  }
}
</script>

<style>
</style>
