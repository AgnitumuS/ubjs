<script>
const Vue = require('vue')
const $App = require('@unitybase/adminui-pub')
const ubInput = require('@unitybase/adminui-vue/components/controls/UbInput.vue').default

const TstDictionaryFt = module.exports.default = {
  name: 'TstDictionaryFt',
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
      return this.$UB.connection.domain.get(this.entityName)
    }
  },
  components: {
    'ub-input': ubInput
  }
}

module.exports.mount = function (params) {
  if (!params.tabId) {
    params.tabId = params.entity
    params.tabId += params.instanceID ? params.instanceID : 'ext' + Ext.id(null, 'addNew')
  }

  let existsTab = Ext.getCmp(params.tabId)
  if (existsTab) {
    $App.viewport.centralPanel.setActiveTab(existsTab)
    return
  }
  let entitySchema = $App.domainInfo.get(params.entity)

  let tab = $App.viewport.centralPanel.add({
    id: params.tabId,
    title: entitySchema.caption,
    tooltip: entitySchema.caption,
    closable: true
  })
  let vm = new Vue({
    render (h) {
      return h(TstDictionaryFt, {
        props: {
          entityName: params.entity,
          instanceID: typeof params.instanceID === 'string' ? parseInt(params.instanceID) : params.instanceID,
          currentTabId: params.tabId,
          formCode: params.formCode
        }
      })
    }
  })
  vm.$mount(`#${params.tabId}-outerCt`)
  tab.on('close', function () {
    vm.$destroy()
  })
  $App.viewport.centralPanel.setActiveTab(tab)
}
</script>

<template>
  <ub-entity-edit
    v-model="entityData"
    :entity-name="entityName"
    :instance-i-d="instanceID"
    :current-tab-id="currentTabId"
    :form-code="formCode"
  >
    <el-form
      ref="form"
      :model="entityData"
      label-width="140px"
      label-position="left"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item :label="entitySchema.attributes['code'].caption">
            <el-input v-model="entityData.code" />
          </el-form-item>
          <el-form-item :label="entitySchema.attributes['caption'].caption">
            <el-input v-model="entityData.caption" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="entitySchema.attributes['filterValue'].caption">
            <el-input v-model="entityData.filterValue" />
          </el-form-item>
          <el-form-item :label="entitySchema.attributes['currencyValue'].caption">
            <ub-input
              v-model="entityData.currencyValue"
              :entity-name="entityName"
              attribute-name="currencyValue"
            />
          </el-form-item>
          <el-form-item :label="entitySchema.attributes['floatValue'].caption">
            <ub-input
              v-model="entityData.floatValue"
              :entity-name="entityName"
              attribute-name="floatValue"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </ub-entity-edit>
</template>
