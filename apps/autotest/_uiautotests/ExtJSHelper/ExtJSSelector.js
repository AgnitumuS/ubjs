/* global Ext */
import { ClientFunction, Selector, t } from 'testcafe'
import { LoginWin } from './loginWindowSelector'

const getWindowError = ClientFunction(prop => window.onerror = prop)

/**
 *
 * @param {string} cssSelector
 * @return {Promise<ExtSelector>}
 */
async function extSelector () {
  let res
  res = new ExtSelector()
  return res
}

class ExtSelector {
  constructor () {
    this.mainToolbar = new TopMenu()
    this.loginWindow = new LoginWindow()
    this.tabpanel = new TabPanel()
    this.leftpanel = new LeftPanel()
  }
}

class LoginWindow {
  async load () {
    await Selector('#UBLogo')()
    await Selector('.ub-login-window')()
  }

  async setCredentials (user, pwd, activeTab) {
    let elValue = ClientFunction((user, pwd, activeTab) => {
      let lw = Ext.ComponentQuery.query('loginwindow')[0]
      lw.textFieldPassword.setValue(pwd)
      lw.textFieldLogin.setValue(user)
      if (activeTab) lw.authTabs.setActiveTab(activeTab)
    })
    await elValue(user, pwd, activeTab)
  }

  async loginBtnClick () {
    await ClientFunction(() => {
      Ext.ComponentQuery.query('button[initialCls=ub-login-btn]')[0].el.dom.click()
    })()
  }

  setValueToADAuth () {}
}

class TopMenu {
  async load () {
    await Selector('.ub-header-menu-container')()
  }

  /**
   * @param {string} desktopCode
   * @return {ItemSelector}
   */
  desktopMenuBtn (desktopCode) {
    let queryCode = '[desktopCode=' + desktopCode + ']'
    return new ItemSelector(queryCode)
  }

  /**
   * @param {string} shortcutCode
   * @return {ItemSelector}
   */
  menuItem (shortcutCode) {
    let queryCode = `[shortcutCode=${shortcutCode}]`
    return new ItemSelector(queryCode)
  }
}

class TabPanel {
  async load () {
    await t.expect(Selector('#ubCenterViewport').exists).ok()
  }

  entityGridPanel (entityName) {
    let queryCode = 'entitygridpanel[entityName=' + entityName + ']'
    return new ItemSelector(queryCode)
  }

  async loadTabPanelChild (xtype, params) {
    let queryCode = (xtype === 'basepanel')
      ? this.getFormPanelQuery(params)
      : `entitygridpanel[entityName=${params.entityName}]`
    let childID = await ClientFunction((q) => {
      return Ext.ComponentQuery.query(q)[0].id
    })(queryCode)
    childID = '#' + childID
    await Selector(childID)()
    await t.expect(Selector(childID).exists).ok(childID)
  }

  getFormPanelQuery (params) {
    if (!params.instanceCode) {
      return 'basepanel[entityName=' + params.entityName + '][isNewInstance=true]'
    }
    return UB.Repository(params.entityName).attrs('ID', params.instanceAttr)
      .where(params.instanceAttr, '=', params.instanceCode).selectSingle()
      .then(instance => {
        return 'basepanel[entityName=' + params.entityName + '][instanceID=' + instance.ID + ']'
      })
  }

  formPanel (entityName, instanceAttr, instanceCode) {
    let formParams = {entityName: entityName, instanceAttr: instanceAttr, instanceCode: instanceCode}
    let queryCode = this.getFormPanelQuery(formParams)
    return new ItemSelector(queryCode)
  }
}

class LeftPanel {
  async load () {
    await Selector('.ub-left-panel')
  }

  desktopMenuBtn () {
    let queryCode = 'button[cls=ub-desktop-button]'
    return new ItemSelector(queryCode)
  }

  async selectDesktopMenuItem (desktopCode) {
    let query = ClientFunction((desktopCode) => {
      let queryCode
      queryCode = UB.Repository('ubm_desktop').attrs('ID', 'code').where('code', '=', 'test_desktop_code').selectSingle()
        .then(res => {
          queryCode = 'menuitem[itemID=' + res.ID + ']'
          return Ext.ComponentQuery.query(queryCode)[0].el.dom.click()
        })
    })
    await query(desktopCode)
  }
}

/*class FormSelector {
  constructor (formCode, instanceAttr, instanceCode) {
    this.queryCode = this.getFormPanelQuery(formCode, instanceAttr, instanceCode)
   }

  getFormPanelQuery (formCode, instanceAttr, instanceCode) {
    let queryCode
    if (!instanceCode) {
      queryCode = 'basepanel[entityName=' + formCode + '][isNewInstance=true]'
    } else {
      UB.Repository(formCode).attrs('ID', instanceAttr).where(instanceAttr, '=', instanceCode).selectSingle()
        .then(instance => {
          queryCode = 'basepanel[entityName=' + formCode + '][instanceID=' + instance.ID + ']'
        })
    }
    return queryCode
  }

  async loadForm (entityName, instanceAttr, instanceCode) {
    let queryCode = this.getFormPanelQuery(entityName, instanceAttr, instanceCode)
    let getFormId = ClientFunction((queryCode) => {
      return Ext.ComponentQuery.query(queryCode)[0].id
    })
    let formID = await getFormId(queryCode)
    formID = '#' + formID
    await Selector(formID)()
    await t.expect(Selector(formID).exists).ok(formID)
  }
}*/

class ItemSelector {
  constructor (queryCode, params) {
    this.queryCode = queryCode
    this.params = params
  }

  innerText () {
    let elText = ClientFunction((querycode) => {
      return Ext.ComponentQuery.query(querycode)[0].el.dom.innerText
    })
    return elText(this.queryCode)
  }

  /**
   * Simulate click on element (on action if passed)
   * @param {Object} params
   * @param {string} [params.actionID]
   * @return {Promise<void>}
   */
  async click (params) {
    let
      actionID,
      elClick
    if (params) actionID = params.actionID
    if (actionID) {
      elClick = ClientFunction((querycode, actionID) => {
        Ext.ComponentQuery.query(querycode)[0].actions[actionID].items[0].el.dom.click()
      })
      await elClick(this.queryCode, actionID)
    } else {
      elClick = ClientFunction((queryCode) => {
        Ext.ComponentQuery.query(queryCode)[0].el.dom.click()
      })
      await elClick(this.queryCode)
    }
  }

  async showMenu () {
    let elShow = ClientFunction((queryCode) => {
      let menuItem = Ext.ComponentQuery.query(queryCode)[0]
      menuItem.menu.show()
    }
    )
    return Promise.resolve(elShow(this.queryCode))
  }

  async setValueToAttr (value, attr) {
    /*let elValue = ClientFunction((queryCode, value) => {
      let caption = Ext.ComponentQuery.query(queryCode)[0]
      if (caption.xtype === 'ubcombobox') {
        caption.store.load().done(() => {
          let store = caption.store.data.items
          if (store.length) {
            store.forEach(item => {
              if (item.data.caption === value) {
                return caption.setValue(item.data.ID)
              }
            })
          }
        })
      }

      else caption.setValue(value)
    })
    return Promise.resolve(elValue(this.queryCode, value))*/
    let elValue = ClientFunction((queryCode, value, attr) => {
      let fields = Ext.ComponentQuery.query(queryCode)[0].fields
      let fieldObj
      if (fields.length) {
        fields.forEach(field => {
          if (field.attributeName === attr) {
            fieldObj = field
          }
        })
      }
      fieldObj.setValue(value)
    })
    await elValue(this.queryCode, value, attr)
  }

  /*getIdByAttr (attr, attrValue) {
    let elID = ClientFunction((queryCode, attr, attrValue) => {
      let id, xtype = Ext.ComponentQuery.query(queryCode)[0].xtype
      if (xtype === 'treeview' || xtype === 'ubtableview') {
        let treeID = Ext.ComponentQuery.query(queryCode)[0].id, itemID
        let treeItems = Ext.ComponentQuery.query(queryCode)[0].store.data.items
        if (treeItems.length) {
          itemID = treeItems.forEach(item => {
            switch (attr) {
              case 'text': {
                if (item.data.text === attrValue) {
                  id = '#' + treeID + '-record-' + item.data.id
                  return id
                }
              }
              case 'code': {
                if (item.data.code === attrValue) {
                  id = '#' + treeID + '-record-' + item.data.ID
                  return id
                }
              }
              default : {}
            }
          })
        }
      }
      else if (xtype === 'tabpanel') {
        let tabpanelArr = Ext.ComponentQuery.query('tabpanel')
        if (tabpanelArr.length) {
          tabpanelArr.forEach(tabpanel => {
            switch (attr) {
              case 'entityName': {
                if (tabpanel.items.items[0].entityName === attrValue) {
                  id = '#' + tabpanel.el.dom.id
                  return id
                }
              }
              default : {}
            }
          })
        }
      }
      else id = '#' + Ext.ComponentQuery.query(queryCode)[0].id

      return id
    })
    return elID(this.queryCode, attr, attrValue)

  }*/
}

export { extSelector, getWindowError }
