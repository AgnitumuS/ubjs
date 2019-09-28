/* globals UDISK, Ext, UB, $App */
/**
 * Dialog for select file & upload it to server into udisk_card.document .
 */
Ext.define('UDISK.AdminUploadForm', {
  extend: 'Ext.window.Window',
  uses: [
    'UB.core.UBLocalStorageManager',
    'UB.core.UBService',
    'UB.core.UBApp',
    'UB.view.ErrorWindow'
  ],

  width: 400,
  height: 200,

  initComponent: function () {
    var me = this

    me.metric = {
      byte: UB.i18n('sizeByte'),
      kiloByte: UB.i18n('sizeKiloByte'),
      megaByte: UB.i18n('sizeMegaByte')
    }

    this.form = Ext.create('Ext.form.Panel', {
      frame: true,
      autoScroll: true,
      method: 'POST',
      waitTitle: UB.i18n('pleaseWait'),
      waitMsgTarget: true,
      items: [
        // me.buttonFile,me.listCmp, this.progressBar
      ]
    })

    Ext.apply(this, {
      // autoShow: true,
      title: UB.i18n('uploadFiles'),
      border: 0,
      layout: 'fit',
      modal: true,
      stateful: true,
      stateId: 'udiskUploadFileWindow',
      // defaultFocus: this.fieldFile,
      items: [this.form],
      buttons: [{
        text: UB.i18n('ok'), // Ext.MessageBox.buttonText.ok,
        scope: this,
        handler: function () {
          me.close()
        }
      }]
    })

    this.callParent()
  },

  upLoad: function () {
    var me = this

    return new Promise((resolve, reject) => {
      var inputDom; var el; var onCancel; var activeEl; var timeoutId

      activeEl = document.activeElement
      inputDom = document.createElement('input')
      el = Ext.fly(inputDom)
      el.set({
        multiple: 'multiple',
        type: 'file'
      })

      onCancel = function () {
        activeEl.removeEventListener('focus', onCancel, false)
        if (inputDom.files.length === 0) {
          timeoutId = setTimeout(function () {
            if (inputDom.files.length === 0) {
              resolve(0)
            }
          }, 500)
        }
      }

      inputDom.addEventListener('change', function (evt) {
        var files = evt.target.files
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        activeEl.removeEventListener('focus', onCancel, false)

        if (files.length === 0) { // !form.isValid()
          resolve(0)
          return
        }
        me.upLoadFiles(inputDom.files)
          .then(function (response) {
            resolve(response)
          }, function (reason) {
            reject(reason)
          })
      }, false)

      inputDom.click()

      activeEl.addEventListener('focus', onCancel, false)
    })
  },

  /**
  * Upload file and resolve ID.
  * @param {File} inFile
  * @returns {Promise}
  */
  doUpload: function (inFile, options) {
    var me = this; var entityID; var record; var progressBar; var params; var promise; var lockExist = false; var name
    name = options.replaceAction !== 'replace' && options.newName ? options.newName : inFile.name
    me.show()
    progressBar = Ext.create('Ext.ProgressBar', { text: name, margin: '4 4 4 4' })

    me.form.add(progressBar)

    if (!options.ID || (options.replaceAction !== 'replace')) {
      promise = $App.connection.addNew({
        entity: me.entityName,
        fieldList: ['ID', 'name', 'parentID', 'fcomment', 'isFolder', 'ownerID', 'fileData']
      })
        .then(function (respAdd) {
          respAdd = UB.LocalDataStore.selectResultToArrayOfObjects(respAdd)
          var params = respAdd[0]
          params.name = name
          params.parentID = me.parentID || null
          params.isFolder = false
          progressBar.updateProgress(0.05)
          return $App.connection.insert({
            entity: me.entityName,
            fieldList: ['ID', 'name', 'parentID', 'fcomment', 'isFolder', 'ownerID', 'fileData', 'mi_modifyDate'],
            execParams: params
          })
        }).then(function (respIns) {
          record = UB.LocalDataStore.selectResultToArrayOfObjects(respIns)
          record = record[0]
          entityID = record.ID
          return $App.connection.select({
            entity: me.entityName,
            ID: entityID,
            fieldList: ['ID'],
            lockType: 'ltTemp'
          }).then(function () {
            lockExist = true
            return respIns
          })
        })
    } else {
      promise = $App.connection.select({
        entity: me.entityName,
        ID: options.ID,
        lockType: 'ltTemp',
        fieldList: ['ID', 'name', 'parentID', 'fcomment', 'isFolder', 'ownerID', 'fileData', 'mi_modifyDate']
      }).then(function (selectResult) {
        record = UB.LocalDataStore.selectResultToArrayOfObjects(selectResult)
        record = record[0]
        entityID = record.ID
      })
    }

    return promise
      .then(function () {
        params = {
          entity: me.entityName,
          attribute: 'fileData',
          origName: name,
          filename: name,
          id: entityID
        }
        progressBar.updateProgress(0.1)
        return $App.connection.post('setDocument', inFile, {
          params: params,
          headers: { 'Content-Type': 'application/octet-stream' }
        }).then(function (resp) {
          resp.recordParams = record
          return resp
        })
      }).then(function (response) {
        params = {
          ID: entityID,
          fileData: JSON.stringify(response.data.result),
          mi_modifyDate: record.mi_modifyDate
        }
        return $App.connection.update({ entity: me.entityName,
          fieldList: ['ID', 'fileData', 'mi_modifyDate'],
          execParams: params
        })
      }).finally(function (res) {
        if (lockExist) {
          return $App.connection.run({
            entity: me.entityName,
            method: 'unlock',
            ID: entityID
          }).then(function (result) {
            if (!result || !result.resultLock || !result.resultLock.success) {
              // todo  throw new Error();
            }
            return res
          })
        } else {
          return res
        }
      })
      .then(function (res) {
        progressBar.updateProgress(1)
        return res.resultData.data[0] // resolve ID
      })
  },

  sizeName: function (value) {
    return value < 1500 ? value + ' ' + this.metric.byte
      : (value < 5000000 ? Math.round(value * 100 / 1024) / 100 + ' ' + this.metric.kiloByte
        : Math.round(value * 100 / 1048576) / 100 + ' ' + this.metric.megaByte)
  },

  /**
     *
     * @param files
     * @returns {Promise}
     */
  upLoadFiles: function (files) {
    var
      me = this; var file; var fileNames = []; var filesObj = {}

    for (let i = 0; i < files.length; i++) {
      fileNames.push(files[i].name)
      filesObj[files[i].name] = files[i]
    }

    return UDISK.AdminView.checkAccess(me.parentID, 'write', me.entityName)
      .then(function () {
        return $App.connection.run({
          method: 'checkNames',
          entity: me.entityName,
          execParams: {
            fileNames: fileNames,
            parentID: me.parentID || null
          }
        })
      }).then(function (response) {
        var renamed = []; var fi; var replaceAction = 'addNew'; var advancedOpt = {}; var adv

        var nameInfo = JSON.parse(response.resultInfo)
        nameInfo.forEach(function (info) {
          if (info.newName) {
            fi = filesObj[info.name]
            advancedOpt[info.name] = {
              ID: info.ID,
              newName: info.newName
            }
            renamed.push(UB.i18n('udiskSizeExistNew', [info.name, me.sizeName(info.size), me.sizeName(fi.size)]))
          } else {
            advancedOpt[info.name] = {}
          }
        })
        function doUploadInner () {
          let promises = []
          for (let i = 0; i < files.length; i++) {
            file = files[i]
            adv = advancedOpt[file.name]
            adv.replaceAction = replaceAction
            promises.push(me.doUpload(file, adv))
          }

          return Promise.all(promises)
        }
        if (renamed.length > 0) {
          return new Promise((resolve, reject) => {
            Ext.Msg.confirm({
              buttons: Ext.MessageBox.YESNOCANCEL,
              icon: Ext.MessageBox.WARNING,
              buttonText: {
                yes: UB.i18n('udiskReplace'),
                no: UB.i18n('udiskAddNew'),
                cancel: UB.i18n('cancel')
              },
              minWidth: 320, // wrong layout when button protrudes beyond form
              title: UB.i18n('udiskReplaceFiles'),
              msg: UB.i18n('udiskReplaceFilesConfirm', [renamed]),
              fn: function (btn) {
                if (btn === 'yes') {
                  replaceAction = 'replace'
                  resolve(doUploadInner())
                }
                if (btn === 'no') {
                  replaceAction = 'addNew'
                  resolve(doUploadInner())
                }
                if (btn === 'cancel') {
                  reject(new UB.UBAbortError())
                }
              }
            })
          })
        } else {
          return doUploadInner()
        }
      })
  }

})
