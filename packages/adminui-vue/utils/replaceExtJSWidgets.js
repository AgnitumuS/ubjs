module.exports = {
  replaceExtJSDialogs,
  replaceExtJSNavbar,
  replaceAutoForms,
  replaceExtJSMessageBarDialog,
  replaceShowList
}

/* global $App, Ext */

const UB = require('@unitybase/ub-pub')
const Vue = require('vue')
const { Notification } = require('element-ui')
const dialogs = require('../components/dialog/UDialog')
const UNavbar = require('../components/navbar/UNavbar.vue').default
const autoForm = require('../components/AutoForm.vue').default
const { dialog, dialogInfo, dialogYesNo, dialogError } = dialogs
const Form = require('./Form/Form')
const { mountTableEntity } = require('./Form/mount')

function replaceExtJSDialogs () {
  // rename buttonText - > buttons, fn -> callback and call `dialog`
  Ext.Msg.confirm = function ({ title, msg, fn: callback, buttonText: buttons }) {
    return dialog({
      title,
      msg,
      buttons,
      type: 'info'
    }).then(r => {
      if (callback) callback(r)
      return r
    })
  }

  $App.dialogYesNo = dialogYesNo
  $App.dialogInfo = dialogInfo
  $App.dialogError = dialogError

  Ext.override(UB.view.BasePanel, {
    showValidationErrors () {
      const errors = []
      let focusCalled = false
      const me = this
      this.getForm().getFields().each(item => {
        if (!item.isValid()) {
          if (!focusCalled) {
            // in case item not rendered yet give it a chance - Ext.callback with delay
            Ext.callback(item.focus, item, [], 100)
            focusCalled = true
          }
          errors.push(item)
        }
      })
      if (errors.length) {
        const fieldLinks = errors.map(f => {
          const text = f.fieldLabel || UB.i18n(`${f.entityName}.${f.name}`)
          return `<a href="#" data-cmd-type="setFocus" data-elm-id="${f.id}">${text}</a>`
        }).join(', ')

        Notification.error({
          title: UB.i18n('error'),
          message: UB.i18n('fieldValidationError', me.domainEntity.caption) + '<br>' + fieldLinks,
          dangerouslyUseHTMLString: true,
          duration: 15000
        })
      }
    }
  })
}

function replaceExtJSNavbar () {
  const id = UB.core.UBApp.viewport.centralPanel.tabBar.id
  const styles = document.createElement('style')
  styles.innerHTML = `#${id}{display:none !important}`
  document.body.appendChild(styles)

  new Vue({
    mounted () {
      const { offsetHeight } = this.$el
      window.UB.core.UBApp.viewport.centralPanel.setMargin(`-${offsetHeight} 0 0 0`)
      window.UB.core.UBApp.viewport.centralPanel.tabBar.setHeight(offsetHeight)
    },
    render: (h) => h(UNavbar, {
      props: {
        withHamburger: true // UB.connection.appConfig.uiSettings.adminUI.customSidebar
      }
    })
  }).$mount(`#${id}`)
}

function replaceAutoForms () {
  const { entity, instanceID, parentContext, isModal } = this

  Form({
    component: autoForm,
    props: { parentContext },
    entity,
    instanceID,
    title: UB.connection.domain.get(entity).caption,
    isModal,
    modalClass: 'ub-dialog__reset-padding'
  })
    .instance()
    .processing()
    .validation()
    .mount()
}

function replaceExtJSMessageBarDialog () {
  $App.on('portal:notify:markAsReaded', (mess) => {
    UB.connection.query({
      entity: 'ubs_message_recipient',
      method: 'accept',
      execParams: {
        ID: mess['recipients.ID']
      }
    }).then(resp => {
      if (resp.resultData) {
        $App.fireEvent('portal:notify:readed', mess.ID, new Date())
      }
    })
  })

  // TODO doOnMessageRetrieved
  // UBS.MessageBar.override({
  //   async doOnMessageRetrieved (messages) {
  //     /**
  //      *  show all messages type except information
  //      *  mark as read after user accepts dialog
  //      */
  //     for (const mess of messages) {
  //       if (mess.messageType !== 'information') {
  //         const confirm = await $App.dialogInfo(mess.messageBody, getTypeLocaleString(mess.messageType))
  //         if (confirm) {
  //           $App.fireEvent('portal:notify:markAsReaded', mess)
  //         }
  //       }
  //     }
  //   }
  // })
}

// replace showList method
function replaceShowList () {
  Ext.override(UB.core.UBCommand, {
    showList () {
      const me = this
      const useVueTables = UB.connection.appConfig.uiSettings.adminUI.useVueTables
      const defaultRenderer = useVueTables ? 'vue' : 'ext'
      const renderer = me.commandConfig.renderer || defaultRenderer
      if (renderer === 'vue') {
        const cfg = me.commandConfig
        const tabId = cfg.tabId
        const title = me.title || me.entity
        /**
         * Test if command cfg use old construction with cfg.params as array.
         * In new construction we use 'repository' or 'entityName' params
         */
        const vueCfgType = cfg.cmdData.hasOwnProperty('repository') || cfg.cmdData.hasOwnProperty('entityName')
        if (vueCfgType) {
          mountTableEntity({
            isModal: cfg.isModal,
            tabId,
            title,
            props: cfg.cmdData,
            scopedSlots: cfg.cmdData.scopedSlots
          })
        } else {
          const req = cfg.cmdData.params[0]
          const fieldList = []
          const columns = []
          for (const field of req.fieldList) {
            if (field === '*') {
              fieldList.push(
                ...UB.connection.domain.get(req.entity)
                  .getAttributeNames()
              )
              columns.push(
                ...UB.connection.domain.get(req.entity)
                  .filterAttribute(a => a.defaultView)
                  .map(a => a.code)
              )
              break
            }
            if (typeof field === 'object') {
              if (field.visibility !== false) {
                columns.push({
                  id: field.name,
                  label: field.description,
                  format: field.format,
                  isHtml: field.isHtml,
                  sortable: field.sortable,
                  isLookup: field.isLookup,
                  align: field.align,
                  headerAlign: field.headerAlign,
                  maxWidth: field.maxWidth,
                  minWidth: field.minWidth,
                  width: field.width
                })
              }
              fieldList.push(field.name)
            } else {
              columns.push(field)
              fieldList.push(field)
            }
          }

          mountTableEntity({
            isModal: cfg.isModal,
            tabId: cfg.tabId,
            title: me.title || me.description || me.entity,
            props: {
              repository () {
                return Object.assign(
                  UB.Repository(req.entity),
                  req,
                  { fieldList }
                )
              },
              columns
            }
          })
        }
      } else {
        this.callParent()
      }
    }
  })
}
