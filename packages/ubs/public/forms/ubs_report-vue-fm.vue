<template>
  <div
    class="u-form-layout"
    v-loading="loading"
  >
    <u-toolbar>
      <u-dropdown
        v-if="!isNew"
        slot="right"
        placement="bottom-start"
        style="margin-left: 0.5em;"
      >
        <u-button
          :title="$ut('testReportTitle')"
          right-icon="u-icon-arrow-down"
          color="primary"
        >
          {{ $ut('testReportTitle') }}
        </u-button>

        <template #dropdown>
          <template v-for="item in dropdownItems">
            <u-dropdown-item
              :label="item.label"
              @click="item.handler"
            />
          </template>
        </template>
      </u-dropdown>
    </u-toolbar>

    <u-form-container label-position="top">
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
            :readonly="false"
          />
        </el-tab-pane>
        <el-tab-pane :label="$ut('templatePanelTitle')">
          <u-auto-field
            attribute-name="template"
            :preview-mode="{
            height: 800,
            width: '100%'
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
const { mapGetters, mapState, mapActions } = require('vuex')
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
  data () {
    return {
      loading: false
    }
  },

  created () {
    this.isDeveloperMode = window.isDeveloperMode
    this.dropdownItems = [{
      label: this.$ut('testReport', 'pdf'),
      handler: () => this.testReport('pdf')
    },
      {
        label: this.$ut('testReport', 'html'),
        handler: () => this.testReport('html')
      },
      {
        label: this.$ut('testReport', 'xlsx'),
        handler: () => this.testReport('xlsx')
      },
      {
        label: this.$ut('testReport', 'docx'),
        handler: () => this.testReport('docx')
      }
    ]
    if (this.isDeveloperMode) {
      this.dropdownItems.push({
        label: this.$ut('testReport', 'server pdf'),
        handler: () => this.testReport('pdf', true)
      })
      this.dropdownItems.push({
        label: this.$ut('testReport', 'server html'),
        handler: () => this.testReport('html', true)
      })
    }
  },

  computed: {
    ...mapInstanceFields(['ID', 'model', 'report_code']),
    ...mapGetters(['isDirty']),
    ...mapState(['isNew'])
  },

  watch: {
    report_code (reportCode) {
      this.ID = UBSession.prototype.crc32(reportCode)
    }
  },

  methods: {
    ...mapActions('save'),

    async testReport (type, serverSide) {
      if (serverSide && !this.isDeveloperMode) {
        await $App.dialogInfo('To test server-side report generation server should be started in `-dev` mode')
        return
      }
      this.loading = true
      try {
        if (this.$store.getters.isDirty) {
          const choice = await $App.dialogYesNo('saveBeforeTestTitle', 'saveBeforeTestBody')
          if (choice) {
            this.$store.dispatch('save')
          } else {
            throw new UB.UBAbortError()
          }
        }

        let req
        if (serverSide) {
          req = {
            method: 'POST',
            url: 'rest/ubs_report/testServerRendering',
            data: {reportCode: this.$store.state.data.report_code, responseType: type, reportParams: {}}
          }
          if (type === 'pdf') req.responseType = 'arraybuffer'
          const reportData = await $App.connection.xhr(req)
          const blobData = new Blob([reportData.data], {
            type: type === 'pdf'
              ? 'application.pdf'
              : 'text/html'
          })
          window.saveAs(blobData, this.$store.state.data.report_code + '.' + type)
        } else {
          if (type === 'xlsx') {
            const data = await Ext.create('UBS.UBReport', {
              code: this.$store.state.data.report_code,
              type: type,
              params: {},
              language: $App.connection.userLang()
            }).makeReport()

            const blobData = new Blob(
              [data.reportData],
              {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}
            )
            window.saveAs(blobData, this.$store.state.data.report_code + '.' + type)
          } else if (type === 'docx') {
            // TODO add docx test
          } else {
            $App.doCommand({
              cmdType: 'showReport',
              cmdData: {
                reportCode: this.$store.state.data.report_code,
                reportType: type,
                reportParams: {},
                reportOptions: {
                  debug: true,
                  allowExportToExcel: true
                }
              }
            })
          }
        }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
