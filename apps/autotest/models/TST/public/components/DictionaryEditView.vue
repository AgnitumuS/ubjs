<template>
  <ub-entity-edit v-model="entityData" :entityName="entityName" :instanceID="instanceID" :currentTabId="currentTabId" :formCode="formCode">
    <el-form ref="form" :model="entityData" label-width="140px" label-position="left">
      <el-form-item :label="entitySchema.attributes['code'].caption">
        <el-input v-model="entityData.code"></el-input>
      </el-form-item>
      <el-form-item :label="entitySchema.attributes['caption'].caption">
        <el-input v-model="entityData.caption"></el-input>
      </el-form-item>
      <el-form-item :label="entitySchema.attributes['filterValue'].caption">
        <el-input v-model="entityData.filterValue"></el-input>
      </el-form-item>
      <el-form-item :label="entitySchema.attributes['currencyValue'].caption">
        <ub-input v-model="entityData.currencyValue" :entityName="entityName" attributeName="currencyValue"></ub-input>
      </el-form-item>
      <el-form-item :label="entitySchema.attributes['floatValue'].caption">
        <ub-input v-model="entityData.floatValue" :entityName="entityName" attributeName="floatValue"></ub-input>
      </el-form-item>
    </el-form>
  </ub-entity-edit>
</template>

<script>
  let ubInput = require('@unitybase/adminui-vue/components/controls/UbInput.vue')
  window.BOUNDLED_BY_WEBPACK = false
  if (BOUNDLED_BY_WEBPACK) {
    ubInput = ubInput.default
  }

  module.exports = {
    name: 'DepartmentEditView',
    props: {
      entityName: {
        type: String,
        required: true
      },
      instanceID: Number,
      currentTabId: String,
      formCode: String
    },
    data () {
      return {
        entityData: {}
      }
    },
    computed: {
      entitySchema () {
        return $App.domainInfo.get(this.entityName)
      }
    },
    components: {
      'ub-input': ubInput
    }
  }
</script>