/* global Ext */
import { ClientFunction, Selector, t } from 'testcafe'

const getWindowError = ClientFunction(prop => window.onerror = prop)

/**
 * Global Ext class
 */
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
  /**
   * waiting for load of login form
   * @returns {Promise.<void>}
   */
  async load () {
    await Selector('#UBLogo')()
    await Selector('.ub-login-window')()
  }

  /**
   * set credentials params to the login form
   * @param {string} authType
   * @param {Object} params
   * @param {string} [params.activeTab]
   * @param {string} [params.pwd]
   * @param {string} [params.user]
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
   * clicks to the Login button in the login form
   * @returns {Promise.<void>}
   */
  async loginBtnClick () {
    await ClientFunction(() => {
      Ext.ComponentQuery.query('button[initialCls=ub-login-btn]')[0].el.dom.click()
    })()
  }
}

class TopMenu {
  /**
   * waiting for load of top menu container
   * @returns {Promise.<void>}
   */
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
   * @returns {EntityGrid}
   */
  entityGridPanel (queryCode) {
    return new EntityGrid(queryCode)
  }

  /**
   * waiting for loading of form panel or entitygrid panel
   * @param {string} xtype
   * @param {Object} params
   * @param {string} params.entityName
   * @param {string} [params.instanceCode]
   * @param {string} [params.instanceAttr]
   * @returns {string}
   */
  async loadTabPanelChild (xtype, params) {
    let queryCode = (xtype === 'basepanel')
      ? await this.getFormPanelQuery(params)
      : `entitygridpanel[entityName=${params.entityName}]`
    let childID = await ClientFunction((q) => {
      if (Ext.ComponentQuery.query(q)[0]) {
        return Ext.ComponentQuery.query(q)[0].id
      } else return 'undefined'
    })(queryCode)
    childID = '#' + childID
    await t.expect(Selector(childID).exists).ok(`${xtype} with entityName ${params.entityName} is undefined`)
    return queryCode
  }

  /**
   *
   * @param {Object} params
   * @param {string} params.entityName
   * @param {string} [params.instanceCode]
   * @param {string} [params.instanceAttr]
   * @returns {string}
   */
  getFormPanelQuery (params) {
    if (!params.instanceCode) {
      return `basepanel[entityName=${params.entityName}][isNewInstance=true]`
    }
    let getForm = ClientFunction(params => {
      if (params.isFormConstructor) {
        let ubmForms = Ext.ComponentQuery.query(`basepanel[entityName=ubm_form]`)
        let idForm
        if (ubmForms.length) {
          ubmForms.forEach(form => {
            if (form.record.data.code === params.instanceCode) idForm = form.id
          })
          return `basepanel[id=${idForm}]`
        }
      } else {
        return UB.Repository(params.entityName).attrs('ID', params.instanceAttr)
          .where(params.instanceAttr, '=', params.instanceCode).selectSingle()
          .then(instance => {
            return `basepanel[entityName=${params.entityName}][instanceID='${instance.ID}]`
          })
      }
    })
    let queryCode = getForm(params)
    return queryCode
  }

  /**
   * returns FormConstructor for ubm_form and BasePanel for other forms
   * @param {string} queryCode
   * @param {boolean} [isFormConstructor]
   * @returns {FormConstructor||BasePanel}
   */
  formPanel (queryCode, isFormConstructor) {
    return (isFormConstructor)
      ? new FormConstructor(queryCode)
      : new BasePanel(queryCode)
  }
}

class EntityGrid {
  constructor (gridCode) {
    this.queryCode = gridCode
    this.rows = new ItemSelector(gridCode)
  }

  /**
   * waiting wor reload entitygridpanel store
   * @returns {Promise.<void>}
   */
  async reload () {
    // не ожидает
    // await ClientFunction((queryCode) => {
    //   while (1) {
    //     if (!Ext.ComponentQuery.query(queryCode)[0].store.loading) return
    //   }
    // })(this.queryCode)
    // - так достаточно задержки, но нужно придумать нормальный алгоритм ожидания подгрузки таблицы
    await Selector('ubdetailview')()
  }

  /**
   * get action button on the grid by actionID
   * @param {string} actionID
   * @returns {ItemSelector}
   */
  getGridAction (actionID) {
    return new ItemSelector(this.queryCode, {actionID: actionID})
  }

  /**
   * select menuitem on top right menu by actionID/ and entityName for showDetail action
   * @param {Object} params
   * @param {string} [params.entityName]
   * @param {string} params.actionID
   * @returns {Promise.<void>}
   */
  async selectAllActionMenuItem (params) {
    let getIem = ClientFunction((queryCode, params) => {
      Ext.ComponentQuery.query('[menuId="AllActions"]')[0].el.dom.click()
      let menu = Ext.ComponentQuery.query(queryCode)[0].menuAllActions
      let menuItems
      menu.forEach(item => {
        if (item.menu) {
          menuItems = item.menu.items.items
          item.menu.show()
        } else if (item.items && item.items.length) menuItems = item.items
        if (menuItems.length) {
          menuItems.forEach(menuItem => {
            if (params.actionID === 'showDetail' && params.entityName) {
              if (menuItem.entityName === params.entityName) {
                menuItem.el.dom.click()
              }
            } else if (menuItem.actionId === params.actionID && menuItem.xtype === 'menuitem' && menuItem.el) {
              menuItem.el.dom.click()
            }
          })
        }
        if (item.menu) item.menu.hide()
      })
    })
    await getIem(this.queryCode, params)
  }

  /**
   * close this grid panel
   * @returns {Promise.<void>}
   */
  async closeGrid () {
    await ClientFunction((queryCode) => {
      return Ext.ComponentQuery.query(queryCode)[0].close()
    })(this.queryCode)
  }
}

class BasePanel {
  constructor (gridCode) {
    this.queryCode = gridCode
    this.items = new ItemSelector(gridCode)
  }

  /**
   * gets action button on the form by actionID
   * @param {string} actionID
   * @returns {ItemSelector}
   */
  getFormAction (actionID) {
    return new ItemSelector(this.queryCode, {actionID: actionID})
  }

  /**
   * finds and clicks on the form tab by the tabID
   * @param {string} tabID
   * @returns {Promise.<void>}
   */
  async selectTab (tabID) {
    await ClientFunction((queryCode, tabID) => {
      let tabPanel = Ext.ComponentQuery.query(queryCode)[0].items.items[0].tabBar.items.items
      if (tabPanel.length) {
        tabPanel.forEach(tab => {
          if (tab.card.tabID === tabID) {
            tab.el.dom.click()
          }
        })
      }
    })(this.queryCode, tabID)
  }

  /**
   * close this form panel
   * @returns {Promise.<void>}
   */
  async closeForm () {
    await ClientFunction((queryCode) => {
      return Ext.ComponentQuery.query(queryCode)[0].close()
    })(this.queryCode)
  }
}

class FormConstructor extends BasePanel {
  /**
   * returns this form 'Interface Definition' value
   * @returns {string}
   */
  getFormDefEditorValue () {
    return ClientFunction((queryCode) => {
      return Ext.ComponentQuery.query(queryCode)[0].formDefEditor.rawValue
    })(this.queryCode)
  }

  /**
   * set to this form 'Interface Definition' value
   * @param {string} value
   * @returns {Promise.<void>}
   */
  async setFormDefEditorValue (value) {
    await ClientFunction((queryCode, value) => {
      return Ext.ComponentQuery.query(queryCode)[0].formDefEditor.codeMirrorInstance.setValue(value)
    })(this.queryCode, value)
  }

  /**
   * returns this form 'Method Definition' value
   * @returns {string}
   */
  getFormCodeValue () {
    return ClientFunction((queryCode) => {
      return Ext.ComponentQuery.query(queryCode)[0].ubAttributeMap.formCode.ubCmp.rawValue
    })(this.queryCode)
  }

  /**
   * check if this form Visual Designer is hidden
   * @returns {boolean}
   */
  checkVisualDesignerVisibility () {
    return ClientFunction((queryCode) => {
      return Ext.ComponentQuery.query(queryCode)[0].designer.hidden
    })(this.queryCode)
  }

  /**
   * returns innerText of this forms Visual Designer
   * @returns {string}
   */
  checkVisualDesignerInnerText () {
    return ClientFunction((queryCode) => {
      return Ext.ComponentQuery.query(queryCode)[0].designer.ownerCt.el.dom.innerText
    })(this.queryCode)
  }
}

class LeftPanel {
  constructor () {
    this.treeItems = new ItemSelector('treeview')
    this.desktopMenuBtn = new ItemSelector('button[cls=ub-desktop-button]')
  }

  /**
   * waiting for load of left menu
   * @returns {Promise.<void>}
   */
  async load () {
    await t
      .expect(Selector('.ub-left-panel').exists).ok()
      .expect(Selector('.x-tree-view').exists).ok()
  }

  /**
   * select desktop by the left panel menu
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
   * get menuitem object on the contextMenu of left panel`s items
   * @param {string} actionID
   * @returns {ItemSelector}
   */
  contextMenuItem (actionID) {
    let queryCode = `menuitem[actionID=${actionID}]`
    return new ItemSelector(queryCode)
  }
}

class BaseWindow {
  constructor () {
    this.modalForm = new ItemSelector('basewindow')
  }

  /**
   * waiting for load of modal form panel
   * @returns {Promise.<void>}
   */
  async load () {
    await Selector('.x-window')()
  }

  /**
   * returns object of action button on this form
   * @param actionID
   * @returns {ItemSelector}
   */
  getFormAction (actionID) {
    return new ItemSelector('basewindow', {actionID: actionID})
  }
}

class ItemSelector {
  constructor (queryCode, params) {
    this.queryCode = queryCode
    this.params = params
  }

  /**
   * returns innerText of component`s DOM
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
  async click () {
    let
      actionID,
      elClick
    if (this.params) actionID = this.params.actionID
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
    })
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

  /**
   * returns DOM id of element by attribute of the owner
   * @param {string} attr
   * @param {string} attrValue
   * @returns {string}
   */
  getIdByAttr (attr, attrValue) {
    let elID = ClientFunction((queryCode, attr, attrValue) => {
      let id
      let xtype = Ext.ComponentQuery.query(queryCode)[0].xtype
      if (xtype === 'treeview' || xtype === 'entitygridpanel') {
        let treeID = (xtype === 'treeview')
          ? Ext.ComponentQuery.query(queryCode)[0].id
          : Ext.ComponentQuery.query(queryCode)[0].view.id
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
              case 'entitygridpanel': {
                if (item.data[attr] === attrValue) {
                  id = `#${treeID}-record-${item.data.ID}`
                  return id
                }
                break
              }
              default : { }
            }
          })
        }
      } else if (xtype === 'basepanel') {
        let formItems = Ext.ComponentQuery.query(queryCode)[0].items.items
        if (formItems.length) {
          formItems.forEach(item => {
            if (item[attr] === attrValue) id = `#${item.id}`
            return id
          })
        }
      } else id = `#${Ext.ComponentQuery.query(queryCode)[0].id}`
      if (!id) id = '#undefined'
      return id
    })
    return elID(this.queryCode, attr, attrValue)
  }
}

export { ExtSelector, getWindowError }
