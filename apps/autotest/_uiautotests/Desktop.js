import { Selector, ClientFunction } from 'testcafe';
import ExtSelector from './ExtJSHelper/ExtJSSelector.js'
import LoginWindow from './ExtJSHelper/loginWindowSelector'

var timestamp = +new Date();
var folderCaption = 'test_folder_' + timestamp;
var folderCode = 'test_code_folder_' + timestamp;

fixture(`Preparing data for Move folder and shortcut to Desktop test`)// declare the fixture
  .page(`http://localhost:888/adm`)

test('Desktop test', async t => {

  const loginWin = Selector('.ub-login-window')
  await loginWin()

  const lwFields = new LoginWindow()
  await lwFields.setValueToUBAuth('admin','admin')

  const loginButton = Selector('.ub-login-btn')
  await t.click(loginButton)

  const mainMenu = Selector('.ub-header-menu-item')//.nth(1)
  await  mainMenu()

  let admBtn = new ExtSelector('button[text=Administrator][ui=default-toolbar-small]')
  await admBtn.click()

  let expandMenu = new ExtSelector('menuitem[text=UI]')
  await expandMenu.showMenu()

  let DesktopItm = new ExtSelector('menuitem[text=Desktops]')
  await DesktopItm.click()

  const ubGrid = Selector('.ub-entity-grid')
  await ubGrid()

  let addBtn = new ExtSelector('button[actionId=addNew]')
  await addBtn.click()

  const basePanel = Selector('.ub-basepanel')
  await basePanel()

  let captionField = new ExtSelector('ubtextfield[attributeName=caption]')
  await captionField.setValue('test_desktop_name')

  let codeField = new ExtSelector('ubtextfield[attributeName=code]')
  await codeField.setValue('test_desktop_code')

  let saveBtn = new ExtSelector('button[actionId=saveAndClose]')
  await saveBtn.click()

  await t
    .debug()

})