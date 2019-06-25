<template>
<div class="ub-form-container">
  <u-toolbar>
    <div slot="right">ID: {{ID}}</div>
  </u-toolbar>

  <u-form-container v-loading="loading">
    <el-row :gutter="20">
      <el-col :md="12" :lg="6">
        <u-auto-field attribute-name="entity" />
      </el-col>
      <el-col :md="12" :lg="5">
        <u-auto-field attribute-name="model" />
      </el-col>
      <el-col :md="12" :lg="7">
        <u-auto-field attribute-name="code" />
      </el-col>
      <el-col :sm="6">
        <u-auto-field attribute-name="ID" readonly />
      </el-col>
    </el-row>

    <u-auto-field attribute-name="description" />
    <u-auto-field attribute-name="caption" />
    <el-row :gutter="20">
      <el-col :md="12" :lg="6">
        <u-auto-field attribute-name="formType" />
      </el-col>
      <el-col :sm="2">
        <u-auto-field attribute-name="isDefault" readonly />
      </el-col>
    </el-row>

  </u-form-container>
</div>
</template>

<script>
const { Form, mapInstanceFields } = require('@unitybase/adminui-vue')
const { mapGetters } = require('vuex')
const UB = require('@unitybase/ub-pub')

module.exports.mount = function ({ title, entity, instanceID, formCode, rootComponent }) {
  Form({
    component: rootComponent,
    entity,
    instanceID,
    title,
    formCode
  })
    .instance()
    .processing()
    .validation()
    .mount()
}

module.exports.default = {
  inject: ['$v', 'entitySchema'],
  computed: {
    ...mapInstanceFields(['ID','code','description','caption','formType','formDef','formCode','model', 'entity','isDefault','mi_modifyDate']),
    ...mapGetters(['loading'])
  }
}
</script>
