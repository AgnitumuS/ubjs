import { ExtSelector } from './ExtJSHelper/ExtJSSelector'
import { Selector } from 'testcafe'
import { deleteExistShortcut, insertDesktop, insertShortcut } from './ExtJSHelper/Preconditions'

const TEST_PAGE = process.env.TEST_PAGE || `http://localhost:8881/ubadminui`
const ext = new ExtSelector()

fixture(`Shortcut test`)
  .page(TEST_PAGE)
  .beforeEach(async t => {
    await t.resizeWindow(1200, 800)
  })

test('Add Shortcut based on existing Shortcut', async t => {
  // login
  let loginWindow = ext.loginWindow
  await loginWindow.load()
  await loginWindow.setCredentials('UB', {pwd: 'admin', user: 'admin'})
  await loginWindow.loginBtnClick()

  let mainToolbar = ext.mainToolbar
  await mainToolbar.load()

  // delete shortcut if exist
  await deleteExistShortcut('test_code_shortcut1')
  // check if Test desktop is exists
  let desktopID = await mainToolbar.desktopMenuBtn('test_desktop_code').getIdByAttr()
  let sel = await Selector(desktopID).exists
  if (!sel) {
    await insertDesktop('test_desktop_code', 'test_desktop_name')
    await mainToolbar.load()
    await t.navigateTo(TEST_PAGE)
    await loginWindow.load()
    loginWindow.setCredentials('UB', {pwd: 'admin', user: 'admin'})
    loginWindow.loginBtnClick()
    await mainToolbar.load()
  }

  // Open Shortcuts' context menu and click button 'Add shortcut'
  let leftPanel = ext.leftPanel
  await leftPanel.load()
  await leftPanel.desktopMenuBtn.click()
  await leftPanel.selectDesktopMenuItem('adm_desktop')
  await leftPanel.load()
  let idMenu = await leftPanel.treeItems.getIdByAttr('code', 'uba_user')
  await t.rightClick(idMenu)
  await leftPanel.contextMenuItem('addShortcut').click()
  // Сhange Desktop on "Desktop" drop-down menu
  let baseWindow = ext.baseWindow
  await baseWindow.load()
  await baseWindow.modalForm.setValueToAttr('test_desktop_name', 'desktopID')
  await baseWindow.modalForm.setValueToAttr('', 'parentID')
  // Fill a field 'Shortcut caption'
  await baseWindow.modalForm.setValueToAttr('test_shortcut1', 'caption')
  // Fill a field 'Code'
  await baseWindow.modalForm.setValueToAttr('test_code_shortcut1', 'code')
  // Enter correct data into tab 'Shortcut source code'
  await baseWindow.modalForm.setValueToAttr(`{
	"cmdType": "showList",
	"cmdData": {
		"params": [
			{
				"entity": "uba_user",
				"method": "select",
				"fieldList": [
					"disabled",
					"isPending",
					"name",
					"firstName",
					"lastName"
				]
			}
		]
	}
}`
    , 'cmdCode')
  // Click on button 'Save and close'
  await baseWindow.getFormAction('saveAndClose').click()
  // Click on new Shortcut on the test desktop

  await leftPanel.desktopMenuBtn.click()
  await leftPanel.selectDesktopMenuItem('test_desktop_code')
  await leftPanel.load()
  let idShortcut = await leftPanel.treeItems.getIdByAttr('code', 'test_code_shortcut1')
  await t.click(Selector(idShortcut))

  let tabPanel = ext.tabPanel
  await tabPanel.load()
  let gridCode = await tabPanel.loadTabPanelChild('entitygridpanel', {entityName: 'uba_user'})
  let grid = tabPanel.entityGridPanel(gridCode)
  let testDesktopRow = await grid.rows.getIdByAttr('name', 'admin')
  await t.expect(Selector(testDesktopRow).exists).ok(`Row with ${testDesktopRow} id not displayed on grid`)
})

test('Add Shortcut', async t => {
  // login
  let loginWindow = ext.loginWindow
  await loginWindow.load()
  await loginWindow.setCredentials('UB', {pwd: 'admin', user: 'admin'})
  await loginWindow.loginBtnClick()

  let mainToolbar = ext.mainToolbar
  await mainToolbar.load()

  // delete shortcut if exist
  await deleteExistShortcut('test_code_shortcut2')
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
  await leftPanel.contextMenuItem('addShortcut').click()
  // Сhange Desktop on "Desktop" drop-down menu
  let baseWindow = ext.baseWindow
  await baseWindow.load()
  await baseWindow.modalForm.setValueToAttr('test_desktop_name', 'desktopID')
  // Fill a field 'Shortcut caption'
  await baseWindow.modalForm.setValueToAttr('test_shortcut2', 'caption')
  // Fill a field 'Code'
  await baseWindow.modalForm.setValueToAttr('test_code_shortcut2', 'code')
  // Enter correct data into tab 'Shortcut source code'
  await baseWindow.modalForm.setValueToAttr(`{
	"cmdType": "showList",
	"cmdData": {
		"params": [
			{
				"entity": "uba_user",
				"method": "select",
				"fieldList": [
					"disabled",
					"isPending",
					"name",
					"firstName",
					"lastName"
				]
			}
		]
	}
}`
    , 'cmdCode')
  // Click on button 'Save and close'
  await baseWindow.getFormAction('saveAndClose').click()
  // Click on new Shortcut on the test desktop

  await leftPanel.desktopMenuBtn.click()
  await leftPanel.selectDesktopMenuItem('test_desktop_code')
  await leftPanel.load()
  let idShortcut = await leftPanel.treeItems.getIdByAttr('code', 'test_code_shortcut2')
  await t.click(Selector(idShortcut))

  let tabPanel = ext.tabPanel
  await tabPanel.load()
  let gridCode = await tabPanel.loadTabPanelChild('entitygridpanel', {entityName: 'uba_user'})
  let grid = tabPanel.entityGridPanel(gridCode)
  let testDesktopRow = await grid.rows.getIdByAttr('name', 'admin')
  await t.expect(Selector(testDesktopRow).exists).ok(`Row with ${testDesktopRow} id not displayed on grid`)
})

test('Edit existing Shortcut', async t => {
  // login
  let loginWindow = ext.loginWindow
  await loginWindow.load()
  await loginWindow.setCredentials('UB', {pwd: 'admin', user: 'admin'})
  await loginWindow.loginBtnClick()
  // Open in the top menu: Administrator- UI- Shortcuts
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
  let cmdCode = `{
	"cmdType": "showList",
	"cmdData": {
		"params": [
			{
				"entity": "uba_user",
				"method": "select",
				"fieldList": [
					"disabled",
					"isPending",
					"name",
					"firstName",
					"lastName"
				]
			}
		]
	}
}`
  await insertShortcut('test_code_shortcut1', 'test_shortcut1', 'test_desktop_code', cmdCode)
  await deleteExistShortcut('test_code_shortcut1_re')
  // Open in the top menu: Administrator- UI- Shortcuts
  await mainToolbar.desktopMenuBtn('adm_desktop').click()
  await mainToolbar.menuItem('adm_folder_UI').showMenu()
  await mainToolbar.menuItem('ubm_navshortcut').click()

  // Open shortcut
  let tabPanel = ext.tabPanel
  await tabPanel.load()
  let gridCode = await tabPanel.loadTabPanelChild('entitygridpanel', {entityName: 'ubm_navshortcut'})
  let grid = tabPanel.entityGridPanel(gridCode)
  // Open Shortcuts' context menu and click button 'Edit'
  let idTestShtRow = await grid.rows.getIdByAttr('code', 'test_code_shortcut1')
  await t.rightClick(idTestShtRow)
  await grid.selectContextMenuItem({actionID: 'edit'})
  let formParams = {
    entityName: 'ubm_navshortcut',
    instanceCode: 'test_code_shortcut1',
    instanceAttr: 'code'
  }
  let formCode = await tabPanel.loadTabPanelChild('basepanel', formParams)
  let form = tabPanel.formPanel(formCode)
  // Rename Shortcut caption
  await form.items.setValueToAttr('test_shortcut1_re', 'caption')
  // Rename Code
  await form.items.setValueToAttr('test_code_shortcut1_re', 'code')
  // Click tab 'Shortcut source code'
  await form.selectTab('Shortcut source code')
  // Delete one colum from code and click button 'Save and close'. Optional refresh page F5
  await form.items.setValueToAttr(`{
	"cmdType": "showList",
	"cmdData": {
		"params": [
			{
				"entity": "uba_user",
				"method": "select",
				"fieldList": [
					"disabled",
					"isPending",
					"name",
					"firstName"
				]
			}
		]
	}
}`
    , 'cmdCode')
  // Click button 'Save and close'
  await form.getFormAction('saveAndClose').click()

  // Reload browser
  await t.navigateTo(TEST_PAGE)
  await loginWindow.load()
  await loginWindow.setCredentials('UB', {pwd: 'admin', user: 'admin'})
  await loginWindow.loginBtnClick()

  // Select renamed Shortcut on top sidebar menu
  await mainToolbar.load()
  await mainToolbar.desktopMenuBtn('test_desktop_code').click()
  // Check Shortcut caption and Code field
  let shortcutID = await mainToolbar.menuItem('test_code_shortcut1_re').getIdByAttr()
  let shortcutSelector = Selector(shortcutID)
  await t.expect(shortcutSelector.innerText).contains('test_shortcut1_re', 'Shortcut was not renamed')
    .click(shortcutSelector)

  // check new code of shortcut
  await tabPanel.load()
  gridCode = await tabPanel.loadTabPanelChild('entitygridpanel', {entityName: 'uba_user'})
  grid = tabPanel.entityGridPanel(gridCode)
  let testDesktopRow = await grid.rows.getIdByAttr('name', 'admin')
  await t.expect(Selector(testDesktopRow).exists).ok(`Row with ${testDesktopRow} id not displayed on grid`)
  let gridText = await grid.rows.innerText()
  await t.expect(gridText).notContains('Last Name', 'grid is contains deleted rows')
})

test('Delete Shortcut', async t => {
// login
  let loginWindow = ext.loginWindow
  await loginWindow.load()
  await loginWindow.setCredentials('UB', {pwd: 'admin', user: 'admin'})
  await loginWindow.loginBtnClick()

  let mainToolbar = ext.mainToolbar
  await mainToolbar.load()
  await insertShortcut('test_code_shortcut1', 'test_shortcut1', 'adm_desktop')

  // Open in the top menu: Administrator- UI- Shortcuts
  await mainToolbar.desktopMenuBtn('adm_desktop').click()
  await mainToolbar.menuItem('adm_folder_UI').showMenu()
  await mainToolbar.menuItem('ubm_navshortcut').click()

  // Open context menu from existing Shortcut and click 'Delete'
  let tabPanel = ext.tabPanel
  await tabPanel.load()
  let gridCode = await tabPanel.loadTabPanelChild('entitygridpanel', {entityName: 'ubm_navshortcut'})
  let grid = tabPanel.entityGridPanel(gridCode)
  let idTestShortcutRow = await grid.rows.getIdByAttr('code', 'test_code_shortcut1')
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
testcafe "chrome:headless" Shortcut.js
testcafe chrome Shortcut.js
testcafe --inspect-brk chrome Shortcut.js
testcafe chrome Shortcut.js --screenshots ./screenshots --screenshots-on-fails
*/
