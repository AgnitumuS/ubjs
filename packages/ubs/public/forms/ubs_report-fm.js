/* global SystemJS */
exports.formCode = {
  initUBComponent: function () {
    this.down('label[ubID="newFormTip"]').setVisible(this.isNewInstance)
  },

  onAfterSave: function () {
    if (SystemJS.reload && !window.__systemHmrUBConnected) {
      let reportModelName = this.record.get('model')
      let reportCode = this.record.get('code')
      let model = $App.domainInfo.models[reportModelName]
      let reportCodePath = `${model.clientRequirePath}/reports/${reportCode}.js`
      SystemJS.reload(reportCodePath)
    }
  },

  testReport: function (type, serverSide) {
    var me = this

    var promise
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
          }).makeReport()
            .then(function (data) {
              var blobData = new Blob(
                [data.reportData],
                {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}
              )
              window.saveAs(blobData, me.record.get('report_code') + '.' + type)
            })
          return
        }

        $App.doCommand({
          'cmdType': 'showReport',
          'cmdData': {
            'reportCode': me.getField('report_code').getValue(),
            'reportType': type, // win.down('combobox').getValue(),
            'reportParams': {},
            'reportOptions': {debug: true}
          }
        })
      }
    })
  }
}
