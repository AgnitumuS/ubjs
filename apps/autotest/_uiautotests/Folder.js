import { ExtSelector } from './ExtJSHelper/ExtJSSelector'
import { Selector } from 'testcafe'
import {
  checkIsShortcutInFolder, deleteExistShortcut, insertDesktop,
  insertShortcut
} from './ExtJSHelper/Preconditions'

const TEST_PAGE = process.env.TEST_PAGE || `http://localhost:8881/ubadminui`
const ext = new ExtSelector()

fixture(`Folder tests`)
  .page(TEST_PAGE)
  .beforeEach(async t => {
    await t.resizeWindow(1200, 800)
  })

test('Add Folder', async t => {
  // login
  let loginWindow = ext.loginWindow
  await loginWindow.load()
  await loginWindow.setCredentials('UB', {pwd: 'admin', user: 'admin'})
  await loginWindow.loginBtnClick()

  let mainToolbar = ext.mainToolbar
  await mainToolbar.load()

  // delete shortcut if exist
  await deleteExistShortcut('test_code_folder')
  // check if Test desktop is exists
  let desktopID = await mainToolbar.desktopMenuBtn('test_desktop_code').getIdByAttr()
  let sel = await Selector(desktopID).exists
  if (!sel) {
    await insertDesktop('test_desktop_code', 'test_desktop_name')
    await mainToolbar.load()
    await t.navigateTo(TEST_PAGE)
    await loginWindow.load()
    await loginWindow.setCredentials('UB', {pwd: 'admin', user: 'admin'})
    await loginWindow.loginBtnClick()
    await mainToolbar.load()
  }

  // Open context menu from empty place on left sidebar menu and click 'Add Shortcut'
  let leftPanel = ext.leftPanel
  await leftPanel.load()
  let treeID = await leftPanel.getID()
  await t.rightClick(treeID)
  await leftPanel.contextMenuItem('addFolder').click()
  // Сhange Desktop on "Desktop" drop-down menu
  let baseWindow = ext.baseWindow
  await baseWindow.load()
  await baseWindow.modalForm.setValueToAttr('test_desktop_name', 'desktopID')
  // Fill a field 'Shortcut caption'
  await baseWindow.modalForm.setValueToAttr('test_folder', 'caption')
  // Fill a field 'Code'
  await baseWindow.modalForm.setValueToAttr('test_code_folder', 'code')
  // Click on button 'Save and close'
  await baseWindow.getFormAction('saveAndClose').click()

  // Verify that new folder displayed on left sidebar
  await leftPanel.desktopMenuBtn.click()
  await leftPanel.selectDesktopMenuItem('test_desktop_code')
  await leftPanel.load()
  let idFolder = await leftPanel.treeItems.getIdByAttr('code', 'test_code_folder')
  await t.expect(Selector(idFolder).exists).ok('The folder test_folder is not view in left sidebar')
})

test('Move Shortcut to Folder', async t => {
  // login
  let loginWindow = ext.loginWindow
  await loginWindow.load()
  await loginWindow.setCredentials('UB', {pwd: 'admin', user: 'admin'})
  await loginWindow.loginBtnClick()

  let mainToolbar = ext.mainToolbar
  await mainToolbar.load()
  // check if Test desktop is exists
  let desktopID = await mainToolbar.desktopMenuBtn('test_desktop_code').getIdByAttr()
  let sel = await Selector(desktopID).exists
  if (!sel) {
    await insertDesktop('test_desktop_code', 'test_desktop_name')
    await mainToolbar.load()
    await t.navigateTo(TEST_PAGE)
    await loginWindow.load()
    await loginWindow.setCredentials('UB', {pwd: 'admin', user: 'admin'})
    await loginWindow.loginBtnClick()
    await mainToolbar.load()
  }
  // check if shortcut and folder is exist
  await insertShortcut('test_code_folder', 'test_folder', 'test_desktop_code')
  await insertShortcut('test_code_shortcut1', 'test_shortcut1', 'test_desktop_code')

  // Open in the top menu: Administrator- UI- Shortcuts
  await mainToolbar.desktopMenuBtn('adm_desktop').click()
  await mainToolbar.menuItem('adm_folder_UI').showMenu()
  await mainToolbar.menuItem('ubm_navshortcut').click()

  // Open shortcuts' context menu and click button 'Edit'
  let tabPanel = ext.tabPanel
  await tabPanel.load()
  let gridCode = await tabPanel.loadTabPanelChild('entitygridpanel', {entityName: 'ubm_navshortcut'})
  let grid = tabPanel.entityGridPanel(gridCode)
  let idTestShortcutRow = await grid.rows.getIdByAttr('code', 'test_code_shortcut1')
  await t.rightClick(idTestShortcutRow)
  await grid.selectContextMenuItem({actionID: 'edit'})
  let formParams = {
    entityName: 'ubm_navshortcut',
    instanceCode: 'test_code_shortcut1',
    instanceAttr: 'code'
  }
  let formCode = await tabPanel.loadTabPanelChild('basepanel', formParams)
  let form = tabPanel.formPanel(formCode)
  // On the page, should be drop-down menu 'Папка ярлика'
  await form.items.setValueToAttr('test_folder', 'parentID')
  await form.getFormAction('save').click()
  let folderFieldID = await form.items.getIdByAttr('attributeName', 'parentID')
  // Verify that the correct folder displayed on 'Папка ярлика' drop-down menu
  let folderFieldValue = await form.items.getValueByID(folderFieldID)
  await t.expect(folderFieldValue).eql('test_folder', 'folder of shortcut was not set correctly')
})

test('Move Shortcut from Folder', async t => {
  // login
  let loginWindow = ext.loginWindow
  await loginWindow.load()
  await loginWindow.setCredentials('UB', {pwd: 'admin', user: 'admin'})
  await loginWindow.loginBtnClick()

  let mainToolbar = ext.mainToolbar
  await mainToolbar.load()
  // check if Test desktop is exists and shortcut is in folder
  let desktopID = await mainToolbar.desktopMenuBtn('test_desktop_code').getIdByAttr()
  let sel = await Selector(desktopID).exists
  if (!sel) {
    await insertDesktop('test_desktop_code', 'test_desktop_name')
    await mainToolbar.load()
    await t.navigateTo(TEST_PAGE)
    await loginWindow.load()
    await loginWindow.setCredentials('UB', {pwd: 'admin', user: 'admin'})
    await loginWindow.loginBtnClick()
    await mainToolbar.load()
  }
  let conditionParams = {
    desktopCode: 'test_desktop_code',
    folderCode: 'test_code_folder',
    folderCaption: 'test_folder',
    shortcutCode: 'test_code_shortcut1',
    shortcutCaption: 'test_shortcut1'
  }
  await checkIsShortcutInFolder(conditionParams)
  // Open in the top menu: Administrator- UI- Shortcuts
  await mainToolbar.desktopMenuBtn('adm_desktop').click()
  await mainToolbar.menuItem('adm_folder_UI').showMenu()
  await mainToolbar.menuItem('ubm_navshortcut').click()

  // Open shortcuts' context menu and click button 'Edit'
  let tabPanel = ext.tabPanel
  await tabPanel.load()
  let gridCode = await tabPanel.loadTabPanelChild('entitygridpanel', {entityName: 'ubm_navshortcut'})
  let grid = tabPanel.entityGridPanel(gridCode)
  let idTestShortcutRow = await grid.rows.getIdByAttr('code', 'test_code_shortcut1')
  await t.rightClick(idTestShortcutRow)
  await grid.selectContextMenuItem({actionID: 'edit'})
  let formParams = {
    entityName: 'ubm_navshortcut',
    instanceCode: 'test_code_shortcut1',
    instanceAttr: 'code'
  }
  let formCode = await tabPanel.loadTabPanelChild('basepanel', formParams)
  let form = tabPanel.formPanel(formCode)
  // Clear the Shortcut folder  textfield
  await form.items.setValueToAttr('', 'parentID')
  let folderFieldID = await form.items.getIdByAttr('attributeName', 'parentID')
  // The textfield must be empty
  let folderFieldValue = await form.items.getValueByID(folderFieldID)
  await t.expect(folderFieldValue).eql('', 'folder of shortcut was nor set correctly')

  // Click button 'Save and close'
  await form.getFormAction('saveAndClose').click()
  // Relogin
  await t.navigateTo(TEST_PAGE)
  loginWindow = ext.loginWindow
  await loginWindow.load()
  await loginWindow.setCredentials('UB', {pwd: 'admin', user: 'admin'})
  await loginWindow.loginBtnClick()
  let leftPanel = ext.leftPanel
  await leftPanel.load()
  await leftPanel.desktopMenuBtn.click()
  await leftPanel.selectDesktopMenuItem('test_desktop_code')
  await leftPanel.load()
  // The folder is empty. The shortcut will be displayed on UB left panel
  let idFolder = await leftPanel.treeItems.getIdByAttr('code', 'test_code_folder')
  let idShortcut = await leftPanel.treeItems.getIdByAttr('code', 'test_code_shortcut1')
  await t
    .expect(Selector(idFolder).exists).ok(`Folder with id ${idFolder} is not exist in Test Desktop menu now`)
    .expect(Selector(idShortcut).exists).ok('shortcut is not display in leftpanel')
})

test('Delete Folder', async t => {
  // login
  let loginWindow = ext.loginWindow
  await loginWindow.load()
  await loginWindow.setCredentials('UB', {pwd: 'admin', user: 'admin'})
  await loginWindow.loginBtnClick()

  let mainToolbar = ext.mainToolbar
  await mainToolbar.load()
  await insertShortcut('test_code_folder', 'test_folder1', 'adm_desktop')
  // Open in the top menu: Administrator- UI- Shortcuts
  await mainToolbar.desktopMenuBtn('adm_desktop').click()
  await mainToolbar.menuItem('adm_folder_UI').showMenu()
  await mainToolbar.menuItem('ubm_navshortcut').click()

  // Open context menu from existing Shortcut and click 'Delete'
  let tabPanel = ext.tabPanel
  await tabPanel.load()
  let gridCode = await tabPanel.loadTabPanelChild('entitygridpanel', {entityName: 'ubm_navshortcut'})
  let grid = tabPanel.entityGridPanel(gridCode)
  let idTestShortcutRow = await grid.rows.getIdByAttr('code', 'test_code_folder')
  await t.rightClick(idTestShortcutRow)
  await grid.selectContextMenuItem({actionID: 'del'})

  // Click on button 'NO'
  let messageBox = ext.messagebox
  await messageBox.selectAction('no')

  // Verify that system closed confirmation message and Desktop is present
  await t
    .expect(Selector('messagebox').exists).notOk('The message window is not closed')
    .expect(Selector(idTestShortcutRow).exists).ok('The desktop with code "test_desktop_code" was deleted')

  // Open context menu from existing Shortcut and click 'Delete'
  await t.rightClick(idTestShortcutRow)
  await grid.selectContextMenuItem({actionID: 'del'})

  // Click on button 'YES'
  await messageBox.selectAction('yes')
  // Verify that system closed confirmation message and Shortcut is deleled
  await t
    .expect(Selector('messagebox').exists).notOk('The message window is not closed')
    .expect(Selector(idTestShortcutRow).exists).notOk('The desktop with code "test_desktop_code" was`nt deleted')
})
/*
run commands
testcafe "chrome:headless" Folder.js
testcafe chrome Folder.js
testcafe --inspect-brk chrome Folder.js
testcafe chrome Folder.js --screenshots ./screenshots --screenshots-on-fails
*/
