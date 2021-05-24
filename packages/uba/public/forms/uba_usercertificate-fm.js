exports.formCode = {
  initUBComponent: function () {
    var me = this, uploadCertBtn, downloadCertBtn
    if (me.parentContext && me.parentContext.userID) {
      me.getField('userID').hide()
      me.getField('userID').oldHidden = true
    }
    uploadCertBtn = me.down('#uploadCertBtn')
    // return;
    uploadCertBtn.on('click', function uploadCertBtnClick () {
      Ext.create('UB.view.UploadFileAjax', {
        entityName: 'uba_usercertificate',
        accept: '.cer',
        scope: this,
        upLoad: async function (btn) {
          const w = btn.up('window')
          const inputDom = this.fieldFile.fileInputEl.dom // getEl()
          if (inputDom.files.length === 0) { // !form.isValid()
            return
          }
          btn.disable()
          const ffile = inputDom.files[0]
          const certResp = await UB.connection.post('/crypto/parseCertificate', ffile)
          const certJson = certResp.data
          const confirmAdding = await $App.dialogYesNo('', JSON.stringify(certJson, null, '\t'))
          if (confirmAdding) {
            me.record.set('issuer_serial', certJson.Issuer)
            me.record.set('serial', certJson.Serial)
            me.record.set('description', certJson.Subject)
            const certBase64 = await UB.base64FromAny(ffile)
            me.addExtendedDataForSave({ certificate: certBase64 })
            me.updateActions()
            w.close()
          }
        }
      })
    })
    downloadCertBtn = me.down('#downloadCertBtn')
    downloadCertBtn.on('click', function () {
      $App.connection.query({
        entity: 'uba_usercertificate',
        method: 'getCertificate',
        ID: me.record.get('ID')
      }).then(function (res) {
        var data = UB.LocalDataStore.selectResultToArrayOfObjects(res)
        var blobData = new Blob(
          [UB.base64toArrayBuffer(data[0].certificate)],
          { type: 'application/x-x509-ca-cert' }
        )
        saveAs(blobData, me.record.get('serial') + '.cer')
      })
    })
  }
}
