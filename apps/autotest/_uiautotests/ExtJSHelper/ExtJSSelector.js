/* global Ext */
import { ClientFunction, Selector, t } from 'testcafe'
import { LoginWin } from './loginWindowSelector'

const getWindowError = ClientFunction(prop => window.onerror = prop);

async function extSelector (cssSelector) {
  let res = new ExtSelector(cssSelector)
  await t.expect(res.find().exists).ok()
  return await res
}

class ExtSelector {
  constructor (selectorCode) {
    this.selectorCode = selectorCode
  }

  querySelector (queryCode) { return new ItemSelector(queryCode) }

  loginWin () { return new LoginWin() }

  find () {
    return (Selector(this.selectorCode))()
  }

}

class ItemSelector {
  constructor (queryCode) {
    this.queryCode = queryCode
  }

  async click () {
    let elClick = ClientFunction((queryCode) => {
      Ext.ComponentQuery.query(queryCode)[0].el.dom.click()
    })
    return await elClick(this.queryCode)
  }

  async showMenu () {
    let elShow = ClientFunction((queryCode) => {
        let menuItem = Ext.ComponentQuery.query(queryCode)[0]
        menuItem.menu.show()
      }
    )
    return await elShow(this.queryCode)
  }

  async setValue (value) {
    let elValue = ClientFunction((queryCode, value) => {
      let caption = Ext.ComponentQuery.query(queryCode)[0]
      if (caption.xtype == 'ubcombobox') {
        caption.store.load().done(() => {
          let store = caption.store.data.items
          if (store.length) {
            store.forEach(item => {
              if (item.data.caption == value) {
                return caption.setValue(item.data.ID)
              }
            })
          }
        })
      }

      else caption.setValue(value)
    })
    return await elValue(this.queryCode, value)
  }

  getIdByAttr (attr, attrValue) {
    let elID = ClientFunction((queryCode, attr, attrValue) => {
      let id, xtype = Ext.ComponentQuery.query(queryCode)[0].xtype;
      if (xtype == 'treeview' || xtype == 'ubtableview') {
        let treeID = Ext.ComponentQuery.query(queryCode)[0].id, itemID
        let treeItems = Ext.ComponentQuery.query(queryCode)[0].store.data.items
        if (treeItems.length) {
          itemID = treeItems.forEach(item => {
            switch (attr) {
              case 'text': {
                if (item.data.text == attrValue) {
                  id = '#' + treeID + '-record-' + item.data.id
                  return id
                }
              }
              case 'code': {
                if (item.data.code == attrValue) {
                  id = '#' + treeID + '-record-' + item.data.ID
                  return id
                }
              }
              default : {}
            }
          })
        }
      }
      else if (xtype == 'tabpanel') {
        let tabpanelArr = Ext.ComponentQuery.query('tabpanel')
        if (tabpanelArr.length) {
          tabpanelArr.forEach(tabpanel => {
            switch (attr) {
              case 'entityName': {
                if (tabpanel.items.items[0].entityName == attrValue) {
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

  }

}

export { extSelector, ExtSelector, getWindowError }
