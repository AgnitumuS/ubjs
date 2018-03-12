import { ClientFunction } from 'testcafe';

export default class LoginWin {
  setValueToUBAuth (user, pwd, activeTab) {
    let elValue = ClientFunction((user, pwd, activeTab) => {
      let lw = Ext.ComponentQuery.query('loginwindow')[0]
      lw.textFieldPassword.setValue(pwd)
      lw.textFieldLogin.setValue(user)
      if (activeTab) lw.authTabs.setActiveTab(activeTab)

    })
    return elValue(user, pwd, activeTab)
  }

  loginBtnClick () {
    return ClientFunction(() => {
      Ext.ComponentQuery.query('button[initialCls=ub-login-btn]')[0].el.dom.click()
    })()
  }

  setValueToADAuth () {}
}