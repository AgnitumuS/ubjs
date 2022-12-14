/* global Ext */
const UB = require('@unitybase/ub-pub')
/**
 * Dialog for select file & upload it to server into document type attribute.
 *
 * Usage sample:
 *
 *      Ext.create('UB.view.UploadFileAjax', {
 *           entityName: entityName,
 *           instanceID: instanceID,
 *           attribute: action.attribute,
 *           scope: this,
 *           callback: function (result) {
 *               if (result.success) {
 *                   var newValue = result.result;
 *               } else {
 *                   UB.showResponseError(result);
 *               }
 *           }
 *       })
 */
Ext.define('UB.view.UploadFileAjax', {
  extend: 'Ext.window.Window',
  alias: 'widget.uploadfileajax',
  uses: [
    'UB.core.UBLocalStorageManager',
    'UB.core.UBService',
    'UB.core.UBApp',
    'UB.view.ErrorWindow'
  ],

  padding: 1,
  uploadData: true,
  /**
   * @cgf accept Optional list of accepted file extensions. See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#Limiting_accepted_file_types
   */
  accept: '',

  initComponent: function () {
    this.fieldFile = Ext.create('Ext.form.field.File', {
      name: 'document',
      allowBlank: false,
      // inputType: 'file',
      blankText: UB.i18n('requiredField'),
      fieldLabel: UB.i18n('vyberiteFayl'),
      anchor: '100%',
      buttonText: '',
      buttonConfig: {
        iconCls: 'iconAttach'
      },
      listeners: {
        afterrender: function (sender) {
          sender.getEl().dom.addEventListener('change', this.onFileSelect, false)
          if (this.accept) {
            sender.button.fileInputEl.dom.setAttribute('accept', this.accept)
          }
          sender.inputEl.on('click', function () {
            this.button.fileInputEl.dom.click()
          }, sender)
        },
        scope: this
      }
    })
    this.progressBar = Ext.create('Ext.ProgressBar')

    this.form = Ext.create('Ext.form.Panel', {
      frame: true,
      method: 'POST',
      waitTitle: UB.i18n('pleaseWait'),
      waitMsgTarget: true,
      items: [this.fieldFile, this.progressBar]
    })

    Ext.apply(this, {
      autoShow: true,
      title: UB.i18n('fayl'),
      border: 0,
      layout: 'fit',
      modal: true,
      stateful: true,
      stateId: UB.core.UBLocalStorageManager.getKeyUI('UploadFileWindowP_window'),
      defaultFocus: this.fieldFile,
      items: [this.form],
      buttons: [{
        text: UB.i18n('load'), // Ext.MessageBox.buttonText.ok,
        scope: this,
        handler: this.upLoad
      }
      ]
    })

    this.callParent()
  },

  onFileSelect: function (evt) {
    // var files = evt.target.files;
  },

  upLoad: function (btn) {
    let w = btn.up('window')
    let waiterStarted = false
    let progressStarted = false

    let inputDom = this.fieldFile.fileInputEl.dom // getEl()
    let pBar = this.progressBar

    if (inputDom.files.length === 0) { // !form.isValid()
      return
    }
    btn.disable()
    let ffile = inputDom.files[0]
    if (!this.uploadData) {
      Ext.callback(w.callback, w.scope, [ffile])
      w.close()
      return
    }

    let params = {
      /**
       * @cfg {String} entityName
       */
      entity: this.entityName,
      /**
       * @cfg {String} attribute
       */
      attribute: this.attribute,
      origName: ffile.name,
      filename: ffile.name,
      /**
       * @cfg {Number} instanceID
       */
      id: this.instanceID
    }

    function doOnProgress (progress) {
      // We get notified of the upload's progress
      if (progress.loaded < progress.total) {
        if (progressStarted) {
          pBar.updateProgress(progress.loaded / progress.total, UB.i18n('loadingData'), true)
        } else {
          progressStarted = (progress.loaded / progress.total < 0.3) // if in first progress event loaded more then 30% do not show progress at all
        }
      } else {
        if (!waiterStarted) {
          pBar.reset()
          waiterStarted = true
          pBar.wait({
            duration: 30000,
            text: UB.i18n('Transformation'),
            animate: true
          })
        }
      }
    }

    UB.connection.setDocument(ffile, params, doOnProgress).then(function (result) {
      Ext.callback(w.callback, w.scope, [{errMsg: '', result: result, success: true}])
    }).finally(function () {
      w.close()
    })
  }
})
