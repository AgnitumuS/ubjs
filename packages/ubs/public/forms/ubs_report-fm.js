/* global SystemJS, $App, Ext, Blob */
const UB = require('@unitybase/ub-pub')
exports.formCode = {
  initUBComponent: function () {
    const me = this
    me.down('label[ubID="newFormTip"]').setVisible(me.isNewInstance)
    me.getField('report_code').addListener('change', me.onCodeChanged, me)
    if (!me.isEditMode) { // new form
      me.record.set('ID', null) // ID will be calculated as crc32(code)
    } else {
      me.getUBCmp('attrReport_code').setReadOnly(true)
      me.getUBCmp('attrModel').setReadOnly(true)
    }
    $App.connection.authorize().then(function (session) { me.CRC32 = session.crc32 })
  },

  onCodeChanged: function (field, newValue) {
    if (this.isEditMode) {
      throw new UB.UBError(`To change existing report code rename both *.js and *.template files in folder 'yourModel/public/reports'`)
    }
    this.record.set('ID', this.CRC32(newValue))
    this.getUBCmp('attrTemplate').setOrigName(newValue.length > 0 ? newValue + '.template' : newValue)
    this.getUBCmp('attrCode').setOrigName(newValue.length > 0 ? newValue + '.js' : newValue)
  },

  onAfterSave: function () {
    if (SystemJS.reload && !window.__systemHmrUBConnected) {
      let reportModelName = this.record.get('model')
      let reportCode = this.record.get('report_code')
      let model = $App.domainInfo.models[reportModelName]
      let reportCodePath = `${model.clientRequirePath}/reports/${reportCode}.js`
      SystemJS.reload(reportCodePath)
    }
  },

  testReport: function (type, serverSide) {
    const me = this

    let promise
    if (me.record.dirty) {
      promise = $App.dialogYesNo('saveBeforeTestTitle', 'saveBeforeTestBody')
        .then(function (choice) {
          if (choice) {
            return me.saveForm()
          } else {
            throw new UB.UBAbortError()
          }
        })
    } else {
      promise = Promise.resolve(true)
    }
    promise.then(function () {
      var req
      if (serverSide) {
        req = {
          method: 'POST',
          url: 'rest/ubs_report/testServerRendering',
          data: {reportCode: me.record.get('report_code'), responseType: type, reportParams: {}}
        }
        if (type === 'pdf') req.responseType = 'arraybuffer'
        $App.connection.xhr(req)
          .then(function (reportData) {
            var blobData = new Blob(
              [reportData.data],
              {type: type === 'pdf' ? 'application.pfd' : 'text/html'}
            )
            window.saveAs(blobData, me.record.get('report_code') + '.' + type)
          })
      } else {
        if (type === 'xlsx') {
          Ext.create('UBS.UBReport', {
            code: me.getField('report_code').getValue(),
            type: type,
            params: {},
            language: $App.connection.userLang()
          }).makeReport().then(function (data) {
            let blobData = new Blob(
              [data.reportData],
              {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}
            )
            window.saveAs(blobData, me.record.get('report_code') + '.' + type)
          })
        } else {
          $App.doCommand({
            cmdType: 'showReport',
            cmdData: {
              reportCode: me.getField('report_code').getValue(),
              reportType: type, // win.down('combobox').getValue(),
              reportParams: {},
              reportOptions: {
                debug: true,
                allowExportToExcel: true
              }
            }
          })
        }
      }
    })
  }
}
