/* global Ext */
import { ClientFunction, Selector, t } from 'testcafe'

const getWindowError = ClientFunction(prop => window.onerror = prop)

class ExtSelector {
  constructor () {
    this.mainToolbar = new TopMenu()
    this.loginWindow = new LoginWindow()
    this.tabPanel = new TabPanel()
    this.leftPanel = new LeftPanel()
    this.baseWindow = new BaseWindow()
  }
}

class LoginWindow {
  async load () {
    await Selector('#UBLogo')()
    await Selector('.ub-login-window')()
  }

  /**
   *
   * @param {string} authType
   * @param params[activeTab][pwd][user]
   * @returns {Promise.<void>}
   */
  async setCredentials (authType, params) {
    let elValue = ClientFunction((authType, params) => {
      let lw = Ext.ComponentQuery.query('loginwindow')[0]
      if (params.activeTab) lw.authTabs.setActiveTab(params.activeTab)
      switch (authType) {
        case 'UB': {
          lw.textFieldPassword.setValue(params.pwd)
          lw.textFieldLogin.setValue(params.user)
          break
        }
        default : {}
      }
    })
    await elValue(authType, params)
  }

  /**
   *
   * @returns {Promise.<void>}
   */
  async loginBtnClick () {
    await ClientFunction(() => {
      Ext.ComponentQuery.query('button[initialCls=ub-login-btn]')[0].el.dom.click()
    })()
  }
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
    let queryCode = `[desktopCode=${desktopCode}]`
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

  /**
   *
   * @param {string} entityName
   * @returns {ItemSelector}
   */
  entityGridPanel (entityName) {
    let queryCode = `entitygridpanel[entityName=${entityName}]`
    return new ItemSelector(queryCode)
  }

  /**
   *
   * @param {string} xtype
   * @param {Object} params[entityName]
   * @returns {Promise.<void>}
   */
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

  /**
   *
   * @param {Object} params[entityName][instanceCode][instanceAttr]
   * @returns {string}
   */
  getFormPanelQuery (params) {
    if (!params.instanceCode) {
      return `basepanel[entityName=${params.entityName}][isNewInstance=true]`
    }
    return UB.Repository(params.entityName).attrs('ID', params.instanceAttr)
      .where(params.instanceAttr, '=', params.instanceCode).selectSingle()
      .then(instance => {
        return `basepanel[entityName=${params.entityName}][instanceID='${instance.ID}]`
      })
  }

  /**
   *
   * @param {string} entityName
   * @param {string} instanceAttr
   * @param {string} instanceCode
   * @returns {ItemSelector}
   */
  formPanel (entityName, instanceAttr, instanceCode) {
    let formParams = {entityName: entityName, instanceAttr: instanceAttr, instanceCode: instanceCode}
    let queryCode = this.getFormPanelQuery(formParams)
    return new ItemSelector(queryCode)
  }
}

class LeftPanel {
  /**
   *
   * @returns {Promise.<void>}
   */
  async load () {
    await t
      .expect(Selector('.ub-left-panel').exists).ok()
      .expect(Selector('.x-tree-view').exists).ok()
  }

  /**
   *
   * @returns {ItemSelector}
   */
  desktopMenuBtn () {
    let queryCode = 'button[cls=ub-desktop-button]'
    return new ItemSelector(queryCode)
  }

  /**
   *
   * @param {string} desktopCode
   * @returns {Promise.<void>}
   */
  async selectDesktopMenuItem (desktopCode) {
    let query = ClientFunction((desktopCode) => {
      let queryCode
      queryCode = UB.Repository('ubm_desktop').attrs('ID', 'code').where('code', '=', desktopCode).selectSingle()
        .then(res => {
          queryCode = `menuitem[itemID=${res.ID}]`
          return Ext.ComponentQuery.query(queryCode)[0].el.dom.click()
        })
    })
    await query(desktopCode)
  }

  /**
   *
   * @returns {ItemSelector}
   */
  treeMenu () {
    let queryCode = 'treeview'
    return new ItemSelector(queryCode)
  }

  /**
   *
   * @param {string} actionID
   * @returns {ItemSelector}
   */
  contextMenuItem (actionID) {
    let queryCode = `menuitem[actionID=${actionID}]`
    return new ItemSelector(queryCode)
  }
}

class BaseWindow {
  /**
   *
   * @returns {Promise.<void>}
   */
  async load () {
    await Selector('.x-window')()
  }

  /**
   *
   * @returns {ItemSelector}
   */
  modalForm () {
    let queryCode = 'basewindow'
    return new ItemSelector(queryCode)
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

  /**
   * returns innerText from component`s DOM
   *@returns {string}
   */
  innerText () {
    let elText = ClientFunction((querycode) => {
      return Ext.ComponentQuery.query(querycode)[0].el.dom.innerText
    })
    return elText(this.queryCode)
  }

  /**
   * Simulates click on element (on action if passed)
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
        (querycode === 'basewindow')
          ? Ext.ComponentQuery.query(querycode)[0].items.items[0].actions[actionID].items[0].el.dom.click()
          : Ext.ComponentQuery.query(querycode)[0].actions[actionID].items[0].el.dom.click()
      })
      await elClick(this.queryCode, actionID)
    } else {
      elClick = ClientFunction((queryCode) => {
        Ext.ComponentQuery.query(queryCode)[0].el.dom.click()
      })
      await elClick(this.queryCode)
    }
  }

  /**
   * Simulates the selection of the drop-down menu
   * @returns {Promise.<T>}
   */
  async showMenu () {
    let elShow = ClientFunction((queryCode) => {
        let menuItem = Ext.ComponentQuery.query(queryCode)[0]
        menuItem.menu.show()
      }
    )
    return Promise.resolve(elShow(this.queryCode))
  }

  /**
   * set value to input attribute on UBForm
   * @param {string} value
   * @param {string} attr
   * @returns {Promise.<void>}
   */
  async setValueToAttr (value, attr) {
    let elValue = ClientFunction((queryCode, value, attr) => {
      let fields = (queryCode === 'basewindow')
        ? Ext.ComponentQuery.query(queryCode)[0].items.items[0].fields
        : Ext.ComponentQuery.query(queryCode)[0].fields
      let fieldObj
      if (fields.length) {
        fields.forEach(field => {
          if (field.attributeName === attr) {
            fieldObj = field
          }
        })
      }
      if (fieldObj.xtype === 'ubcombobox') {
        fieldObj.store.load().done(() => {
          let store = (queryCode === 'basewindow')
            ? fieldObj.store.data.items[0].store.data.items
            : fieldObj.store.data.items

          if (store.length) {
            store.forEach(item => {
              if (item.data.caption === value) {
                return fieldObj.setValue(item.data.ID)
              }
            })
          }
        })
      } else fieldObj.setValue(value)
    })
    await elValue(this.queryCode, value, attr)
  }

  getIdByAttr (attr, attrValue) {
    let elID = ClientFunction((queryCode, attr, attrValue) => {
      let id
      let xtype = Ext.ComponentQuery.query(queryCode)[0].xtype
      if (xtype === 'treeview' || xtype === 'ubtableview') {
        let treeID = Ext.ComponentQuery.query(queryCode)[0].id
        let treeItems = Ext.ComponentQuery.query(queryCode)[0].store.data.items
        if (treeItems.length) {
          treeItems.forEach(item => {
            switch (xtype) {
              case 'treeview': {
                if (item.raw[attr] === attrValue) {
                  id = `#${treeID}-record-${item.raw.id}`
                  return id
                }
                break
              }
              case 'ubtableview': {
                if (item.data[attr] === attrValue) {
                  id = `#${treeID}-record-${item.data.ID}`
                  return id
                }
                break
              }
              default : {}
            }
          })
        }
      } else if (xtype === 'tabPanel') {
        let tabpanelArr = Ext.ComponentQuery.query('tabPanel')
        if (tabpanelArr.length) {
          tabpanelArr.forEach(tabpanel => {
            switch (attr) {
              case 'entityName': {
                if (tabpanel.items.items[0].entityName === attrValue) {
                  id = `#${tabpanel.el.dom.id}`
                  return id
                }
                break
              }
              default : {}
            }
          })
        }
      }
      else id = `#${Ext.ComponentQuery.query(queryCode)[0].id}`

      return id
    })
    return elID(this.queryCode, attr, attrValue)

  }
}

export { ExtSelector, getWindowError }
