<script>
const Vue = require('vue')
const $App = require('@unitybase/adminui-pub')
const UInput = require('@unitybase/adminui-vue/components/controls/UInput.vue').default
const UInputNumber = require('@unitybase/adminui-vue/components/controls/UInputNumber.vue').default
const UCodeMirror = require('@unitybase/adminui-vue/components/controls/UCodeMirror.vue').default

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
      instance: {}
    }
  },
  computed: {
    entitySchema () {
      return this.$UB.connection.domain.get(this.entityName)
    }
  },
  methods: {
    assignInstanceData (instanceData) {
      this.instance = instanceData
    }
  },
  components: {
    UInput, UInputNumber, UCodeMirror
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
    :entity-name="entityName"
    :instance-id="instanceID"
    :instance="instance"
    :current-tab-id="currentTabId"
    :form-code="formCode"
    @data-loaded="assignInstanceData"
  >
    <el-form
      ref="form"
      :model="instance"
      label-width="140px"
      label-position="left"
    >
      <el-row :gutter="20">
        <!--responsive. for large screen a half of screen width, for small - full width -->
        <el-col :lg="12" :sm="24">
          <el-form-item :label="entitySchema.attributes['code'].caption">
            <u-input :entity-name="entityName" attribute-name="code" v-model="instance.code" />
          </el-form-item>
          <el-form-item :label="entitySchema.attributes['caption'].caption">
            <u-input :entity-name="entityName" attribute-name="caption" v-model="instance.caption" :object-value="instance"/>
          </el-form-item>
          <el-form-item :label="entitySchema.attributes['booleanColumn'].caption">
            <el-checkbox v-model="instance.booleanColumn" />
          </el-form-item>
        </el-col>
        <el-col :lg="12" :sm="24">
          <el-form-item :label="entitySchema.attributes['filterValue'].caption">
            <u-input-number :entity-name="entityName" attribute-name="filterValue" v-model="instance.filterValue" />
          </el-form-item>
          <el-form-item :label="entitySchema.attributes['currencyValue'].caption">
            <u-input-number
              v-model="instance.currencyValue"
              :entity-name="entityName"
              attribute-name="currencyValue"
            />
          </el-form-item>
          <el-form-item :label="entitySchema.attributes['floatValue'].caption">
            <u-input-number
              v-model="instance.floatValue"
              :entity-name="entityName"
              attribute-name="floatValue"
            />
          </el-form-item>
        </el-col>
          <el-col>
           <el-form-item :label="entitySchema.attributes['jsonColumn'].caption">
            <u-code-mirror
              v-model="instance.jsonColumn"
              :entity-name="entityName"
              attribute-name="jsonColumn"
              :value-is-json="true"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </ub-entity-edit>
</template>
