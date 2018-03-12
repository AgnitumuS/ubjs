import { ClientFunction, Selector } from 'testcafe';
import LoginWindow from './loginWindowSelector'

export default class ExtSelector {
  constructor (selectorCode) {
    this.selectorCode = selectorCode
  }

  itemSelector (queryCode) {return new ItemSelector(queryCode)}

  loginWinItems () { return new LoginWindow()}

  find () {
    return Selector(this.selectorCode)()
  }
}

class ItemSelector {
  constructor (queryCode) {
    this.queryCode = queryCode
  }

  click () {
    let elClick = ClientFunction((queryCode) => {
      Ext.ComponentQuery.query(queryCode)[0].el.dom.click()
    })
    return elClick(this.queryCode)
  }

  showMenu () {
    let elShow = ClientFunction((queryCode) => {
        let menuItem = Ext.ComponentQuery.query(queryCode)[0]
        menuItem.menu.show()
      }
    )
    return elShow(this.queryCode)
  }

  setValue (value) {
    let elValue = ClientFunction((queryCode, value) => {
      let caption = Ext.ComponentQuery.query(queryCode)[0]
      caption.setValue(value)
    })
    return elValue(this.queryCode, value)
  }
}




