import { ClientFunction } from 'testcafe'

class LoginWin {
  async setValueToUBAuth (user, pwd, activeTab) {
    let elValue = ClientFunction((user, pwd, activeTab) => {
      let lw = Ext.ComponentQuery.query('loginwindow')[0]
      lw.textFieldPassword.setValue(pwd)
      lw.textFieldLogin.setValue(user)
      if (activeTab) lw.authTabs.setActiveTab(activeTab)

    })
    return Promise.resolve(elValue(user, pwd, activeTab))
  }

  async loginBtnClick () {
    return Promise.resolve(ClientFunction(() => {
      Ext.ComponentQuery.query('button[initialCls=ub-login-btn]')[0].el.dom.click()
    })())
  }

  setValueToADAuth () {}
}

export { LoginWin }