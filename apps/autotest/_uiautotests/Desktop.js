import { Selector } from 'testcafe';
import ExtSelector from './ExtJSHelper/ExtJSSelector.js'
//import LoginWindow from './ExtJSHelper/loginWindowSelector'

var timestamp = +new Date();
var folderCaption = 'test_folder_' + timestamp;
var folderCode = 'test_code_folder_' + timestamp;

fixture(`Preparing data for Move folder and shortcut to Desktop test`)// declare the fixture
  .page(`http://localhost:888/adm`)

test('Desktop test', async t => {

  const loginWin = new ExtSelector('.ub-login-window')
  await loginWin.find()
  await loginWin.loginWinItems().setValueToUBAuth('admin', 'admin')
  await loginWin.loginWinItems().loginBtnClick()

  const mainMenu = new ExtSelector('.ub-header-menu-item')
  await mainMenu.find()
  await mainMenu.itemSelector('button[text=Administrator][ui=default-toolbar-small]').click()
  await mainMenu.itemSelector('menuitem[text=UI]').showMenu()
  await mainMenu.itemSelector('menuitem[text=Desktops]').click()

  const ubGrid = new ExtSelector('.ub-entity-grid')
  await ubGrid.find()
  await ubGrid.itemSelector('button[actionId=addNew]').click()

  const basePanel = new ExtSelector('.ub-basepanel')
  await basePanel.find()
  await basePanel.itemSelector('ubtextfield[attributeName=caption]').setValue('test_desktop_name')
  await basePanel.itemSelector('ubtextfield[attributeName=code]').setValue('test_desktop_code')
  await basePanel.itemSelector('button[actionId=saveAndClose]').click()

})