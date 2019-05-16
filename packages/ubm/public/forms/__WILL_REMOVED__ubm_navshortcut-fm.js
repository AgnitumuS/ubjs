var entityRe = /"entity"\s*:\s*"(\w*)"/

exports.formCode = {
  initUBComponent: function () {
    var me = this
    me.attributeGrid = this.down('commandbuilderentitytreepanel')
    me.getField('cmdCode').addListener('change', me.onCmdCodeChanged, me)
    me.onCmdCodeChanged(null, me.getField('cmdCode').getValue()) // initial data
    me.attributeGrid.addListener('itemdblclick', me.onEntityAttributeGridClick, me)

    me.getField('cmdCode').codeSnippetsGetter = this.codeSnippetsGetter.bind(this)

    if (me.commandConfig.instanceID) return // edit mode

    if (!me.commandConfig.isFolder) {
      me.getField('cmdCode').setValue('//remove this line and when press Ctrl+Q for code templates')
    } else {
      me.getField('isFolder').setValue(true)
    }

    var ds = me.commandConfig.desktopID || $App.getDesktop()
    if (ds) {
      me.getField('desktopID').setValueById(ds)
    }
    if (me.commandConfig.parentID) {
      me.getField('parentID').setValueById(me.commandConfig.parentID)
    }
  },

  codeSnippetsGetter: function () {
    return [{
      displayText: 'showList',
      text: JSON.stringify({
        'cmdType': 'showList',
        'cmdData': {
          'params': [{
            'entity': 'TYPE-ENTITY-CODE',
            'method': 'select',
            'fieldList': ['Dbl-CLICK on left prop panel to add attribute']
          }]
        }
      }, null, '  ')
    }, {
      displayText: 'showForm',
      text: JSON.stringify({
        'cmdType': 'showForm',
        'formCode': 'TYPE HERE A FORM CODE FROM UBM_FORM or remove this line to use a default form for entity',
        'entity': 'TYPE HERE A ENTITY CODE',
        'instanceID': 'REPLACE IT by ID value (to edit element) or remove this line'
      }, null, '  ')
    }, {
      displayText: 'showReport',
      text: JSON.stringify({
        cmdType: 'showReport',
        description: 'OPTIONAL report form caption',
        cmdData: {
          reportCode: 'type here report code',
          reportType: 'html or pdf',
          reportParams: { // if passed report viewer will skip showing parameters enter form to user
            paramName: 'param value'
          }
        }
      }, null, '  ')
    }]
  },

  onCmdCodeChanged: function (field, newValue) {
    var res
    if (_.isString(newValue)) {
      res = entityRe.exec(newValue)
      if (res) {
        this.attributeGrid.setEntity(res[1])
      }
    }
  },

  onEntityAttributeGridClick: function (tree, record) {
    var textToInsert
    var aCodeMirror
    if (record) {
      textToInsert = '"' + record.get('id') + '"'
      aCodeMirror = this.down('ubcodemirror').codeMirrorInstance
      aCodeMirror.replaceSelection(textToInsert)
      aCodeMirror.getInputField().focus()
    }
  }
}
