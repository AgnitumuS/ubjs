function showPasswordChangeDialog () {
  var form = this

  $App.showModal({
    formCode: 'uba_user-changeUserPassword',
    description: UB.i18n('changePassword'),
    customParams: 'admin'
  }).done(function (result) {
    if (result.action === 'ok') {
      $App.connection.xhr({
        url: 'changePassword',
        method: 'POST',
        data: {
          newPwd: result.newPwd,
          pwd: result.pwd,
          needChangePassword: result.needChangePassword,
          forUser: form.getField('name').getValue()
        }
      }).done(function () {
        $App.dialogInfo('passwordChangedSuccessfully').done()
      })
    }
  })
}

exports.formCode = {
  addBaseActions: function () {
    this.callParent(arguments)
    this.actions.ActionChangePasswordID = new Ext.Action({
      actionId: 'ActionChangePasswordID',
      actionText: UB.i18n('changePassword'),
      handler: showPasswordChangeDialog.bind(this)
    })
  }
}
