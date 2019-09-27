function showPasswordChangeDialog () {
  var form = this

  $App.showModal({
    formCode: 'uba_user-changeUserPassword',
    description: UB.i18n('changePassword'),
    customParams: 'admin'
  }).then(function (result) {
    if (result.action === 'ok') {
      $App.connection.query({
        fieldList: [],
        entity: 'uba_user',
        method: 'changeOtherUserPassword',
        execParams: {
          newPwd: result.newPwd,
          needChangePassword: result.needChangePassword,
          forUser: form.getField('name').getValue()
        }
      }).then(function () {
        $App.dialogInfo('passwordChangedSuccessfully')
      })
    }
  })
}

exports.formCode = {
  dataBind: {
    fullName: {
      value: '({lastName} || "?") + " " + ({firstName} || "?")'
    }
  },

  initUBComponent: function () {
    UBS.dataBinder.applyBinding(this)
  },

  addBaseActions: function () {
    this.callParent(arguments)
    this.actions.ActionChangePasswordID = new Ext.Action({
      actionId: 'ActionChangePasswordID',
      actionText: UB.i18n('changePassword'),
      handler: showPasswordChangeDialog.bind(this),
      disabled: !$App.domainInfo.isEntityMethodsAccessible('uba_user', 'changeOtherUserPassword')
    })
  }
}
