<template>
<div class="u-form-layout">
  <u-toolbar />

  <u-form-container
    v-loading="loading"
    label-position="top"
  >
     <!-- place form layout here -->
    <u-grid template-columns="150px 300px 1fr">
      <u-form-row label="Model">
        <el-select v-model="model" :disabled="!isNew">
          <el-option
            v-for="m in $UB.connection.domain.orderedModels"
            :key="m.name"
            :label="m.name"
            :value="m.name">
          </el-option>
        </el-select>
      </u-form-row>
      <u-auto-field attribute-name="report_code" :readonly="!isNew" />
      <u-auto-field attribute-name="name" />
    </u-grid>
    <label v-if="isNew"> TIP: Save form for script and template boilerplate generation </label>
    <label v-else>
      To change existing report code rename <code>{{report_code}}.js</code>, <code>{{report_code}}.template</code>
      and modify a <code>{{report_code}}.ubrow</code> files in the folder <code>{{model}}/public/reports</code>
    </label>
    <el-tabs>
      <el-tab-pane :label="$ut('codePanelTitle')">
        <u-auto-field
          attribute-name="code"
          :preview-mode="{
            height: 800,
            width: '100%'
          }"
          :remove-default-buttons="['webcam', 'scan', 'scanSettings', 'add', 'remove']"
          :readonly="true"
        />
      </el-tab-pane>
      <el-tab-pane :label="$ut('templatePanelTitle')">
        <u-auto-field
          attribute-name="template"
          :preview-mode="{
            height: 800,
            // landscape: { width: 1121
            width: '793px'
          }"
          :remove-default-buttons="['webcam', 'scan', 'scanSettings']"
        />
      </el-tab-pane>
    </el-tabs>
  </u-form-container>
</div>
</template>

<script>
const { Form, mapInstanceFields } = require('@unitybase/adminui-vue')
const { mapGetters, mapState } = require('vuex')
const UB = require('@unitybase/ub-pub')
const UBSession = require('@unitybase/cs-shared').UBSession

module.exports.mount = function (cfg) {
  Form(cfg)
    .processing()
    .validation()
    .mount()
}

module.exports.default = {
  name: 'ubs_report-vue',
  inject: ['$v', 'entitySchema'],
  computed: {
    ...mapInstanceFields(['ID', 'model', 'report_code']),
    ...mapGetters(['loading']),
    ...mapState(['isNew'])
  },
  watch: {
    report_code (reportCode) {
      this.ID = UBSession.prototype.crc32(reportCode)
    }
  },
  methods: {

  }
}
</script>
