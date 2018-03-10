import { ClientFunction } from 'testcafe';

export default class ExtSelector {
  constructor (queryCode) {
    this.queryCode = queryCode
  }

  showMenu () {
    let elShow = ClientFunction((queryCode) => {
        let menuItem = Ext.ComponentQuery.query(queryCode)[0]
        menuItem.menu.show()
      }
    )
    return elShow(this.queryCode)
  }

  click () {
    let elClick = ClientFunction((queryCode) => {
      Ext.ComponentQuery.query(queryCode)[0].el.dom.click()
    })
    return elClick(this.queryCode)
  }

  setValue (value) {
    let elValue = ClientFunction((queryCode, value) => {
      let caption = Ext.ComponentQuery.query(queryCode)[0]
      caption.setValue(value)
    })
    return elValue(this.queryCode, value)
  }
  setValueToUBAuth(user, pwd, activeTab){
    let elValue = ClientFunction((user, pwd, activeTab) => {
      let lw = Ext.ComponentQuery.query('loginwindow')[0]
      lw.textFieldPassword.setValue(pwd)
      lw.textFieldLogin.setValue(user)
      if(activeTab) lw.authTabs.setActiveTab(activeTab)

    })
    if(this.queryCode = 'loginwindow')
    return elValue(user, pwd, activeTab)
  }

}




