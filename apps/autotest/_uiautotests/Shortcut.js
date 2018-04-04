import { ExtSelector } from './ExtJSHelper/ExtJSSelector'
import { Selector } from 'testcafe'
import { deleteExistShortcut, insertDesktop, insertShortcut } from './ExtJSHelper/Preconditions'

const TEST_PAGE = process.env.TEST_PAGE || `http://localhost:888/adm-dev`
const ext = new ExtSelector()

fixture(`Preparing data for moving folder and shortcut to Desktop test`)
  .page(TEST_PAGE)
//
// test('Add Shortcut based on existing Shortcut', async t => {
//   // login
//   let loginWindow = ext.loginWindow
//   await loginWindow.load()
//   loginWindow.setCredentials('UB', {pwd: 'admin', user: 'admin'})
//   loginWindow.loginBtnClick()
//
//   let mainToolbar = ext.mainToolbar
//   await mainToolbar.load()
//
//   // delete shortcut if exist
//   await deleteExistShortcut('test_code_shortcut1')
//   // check if Test desktop is exists
//   let desktopID = await mainToolbar.desktopMenuBtn('test_desktop_code').getIdByAttr()
//   let sel = await Selector(desktopID).exists
//   if (!sel) {
//     await insertDesktop('test_desktop_code', 'test_desktop_name')
//     await mainToolbar.load()
//     await t.navigateTo(TEST_PAGE)
//     await loginWindow.load()
//     loginWindow.setCredentials('UB', {pwd: 'admin', user: 'admin'})
//     loginWindow.loginBtnClick()
//     await mainToolbar.load()
//   }
//
//   // Open Shortcuts' context menu and click button 'Add shortcut'
//   let leftPanel = ext.leftPanel
//   await leftPanel.load()
//   let idMenu = await leftPanel.treeItems.getIdByAttr('code', 'uba_user')
//   await t.rightClick(idMenu)
//   leftPanel.contextMenuItem('addShortcut').click()
//   // Сhange Desktop on "Desktop" drop-down menu
//   let baseWindow = ext.baseWindow
//   await baseWindow.load()
//   baseWindow.modalForm.setValueToAttr('test_desktop_name', 'desktopID')
//   baseWindow.modalForm.setValueToAttr('', 'parentID')
//   // Fill a field 'Shortcut caption'
//   baseWindow.modalForm.setValueToAttr('test_shortcut1', 'caption')
//   // Fill a field 'Code'
//   baseWindow.modalForm.setValueToAttr('test_code_shortcut1', 'code')
//   // Enter correct data into tab 'Shortcut source code'
//   baseWindow.modalForm.setValueToAttr(`{
// 	"cmdType": "showList",
// 	"cmdData": {
// 		"params": [
// 			{
// 				"entity": "uba_user",
// 				"method": "select",
// 				"fieldList": [
// 					"disabled",
// 					"isPending",
// 					"name",
// 					"firstName",
// 					"lastName"
// 				]
// 			}
// 		]
// 	}
// }`
//     , 'cmdCode')
//   // Click on button 'Save and close'
//   baseWindow.getFormAction('saveAndClose').click()
//   // Click on new Shortcut on the test desktop
//
//   leftPanel.desktopMenuBtn.click()
//   leftPanel.selectDesktopMenuItem('test_desktop_code')
//   await leftPanel.load()
//   let idShortcut = await leftPanel.treeItems.getIdByAttr('code', 'test_code_shortcut1')
//   await t.click(Selector(idShortcut))
// })
//
// test('Add Shortcut', async t => {
//   // login
//   let loginWindow = ext.loginWindow
//   await loginWindow.load()
//   loginWindow.setCredentials('UB', {pwd: 'admin', user: 'admin'})
//   loginWindow.loginBtnClick()
//
//   let mainToolbar = ext.mainToolbar
//   await mainToolbar.load()
//
//   // delete shortcut if exist
//   await deleteExistShortcut('test_code_shortcut2')
//   // check if Test desktop is exists
//   let desktopID = await mainToolbar.desktopMenuBtn('test_desktop_code').getIdByAttr()
//   let sel = await Selector(desktopID).exists
//   if (!sel) {
//     await insertDesktop('test_desktop_code', 'test_desktop_name')
//     await mainToolbar.load()
//     await t.navigateTo(TEST_PAGE)
//     await loginWindow.load()
//     loginWindow.setCredentials('UB', {pwd: 'admin', user: 'admin'})
//     loginWindow.loginBtnClick()
//     await mainToolbar.load()
//   }
//
//   // Open context menu from empty place on left sidebar menu and click 'Add Shortcut'
//   let leftPanel = ext.leftPanel
//   await leftPanel.load()
//   let treeID = await leftPanel.getID()
//   await t.rightClick(treeID)
//   leftPanel.contextMenuItem('addShortcut').click()
//   // Сhange Desktop on "Desktop" drop-down menu
//   let baseWindow = ext.baseWindow
//   await baseWindow.load()
//   baseWindow.modalForm.setValueToAttr('test_desktop_name', 'desktopID')
//   // Fill a field 'Shortcut caption'
//   baseWindow.modalForm.setValueToAttr('test_shortcut2', 'caption')
//   // Fill a field 'Code'
//   baseWindow.modalForm.setValueToAttr('test_code_shortcut2', 'code')
//   // Enter correct data into tab 'Shortcut source code'
//   baseWindow.modalForm.setValueToAttr(`{
// 	"cmdType": "showList",
// 	"cmdData": {
// 		"params": [
// 			{
// 				"entity": "uba_user",
// 				"method": "select",
// 				"fieldList": [
// 					"disabled",
// 					"isPending",
// 					"name",
// 					"firstName",
// 					"lastName"
// 				]
// 			}
// 		]
// 	}
// }`
//     , 'cmdCode')
//   // Click on button 'Save and close'
//   baseWindow.getFormAction('saveAndClose').click()
//   // Click on new Shortcut on the test desktop
//
//   leftPanel.desktopMenuBtn.click()
//   leftPanel.selectDesktopMenuItem('test_desktop_code')
//   await leftPanel.load()
//   let idShortcut = await leftPanel.treeItems.getIdByAttr('code', 'test_code_shortcut2')
//   await t.click(Selector(idShortcut))
// })

test('Edit existing Shortcut', async t => {
  // login
  let loginWindow = ext.loginWindow
  await loginWindow.load()
  loginWindow.setCredentials('UB', {pwd: 'admin', user: 'admin'})
  loginWindow.loginBtnClick()
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
    loginWindow.setCredentials('UB', {pwd: 'admin', user: 'admin'})
    loginWindow.loginBtnClick()
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
  await deleteExistShortcut('test_code_shotcut1_re')
  // Open in the top menu: Administrator- UI- Shortcuts
  mainToolbar.desktopMenuBtn('adm_desktop').click()
  mainToolbar.menuItem('adm_folder_UI').showMenu()
  mainToolbar.menuItem('ubm_navshortcut').click()

  // Open shortcut
  let tabPanel = ext.tabPanel
  await tabPanel.load()
  let gridCode = await tabPanel.loadTabPanelChild('entitygridpanel', {entityName: 'ubm_navshortcut'})
  let grid = tabPanel.entityGridPanel(gridCode)
  // Open Shortcuts' context menu and click button 'Edit'
  let idTestShtRow = await grid.rows.getIdByAttr('code', 'test_code_shortcut1')
  await t.rightClick(idTestShtRow)
  grid.selectContextMenuItem({actionID: 'edit'})
  let formParams = {
    entityName: 'ubm_navshortcut',
    instanceCode: 'test_code_shortcut1',
    instanceAttr: 'code'
  }
  let formCode = await tabPanel.loadTabPanelChild('basepanel', formParams)
  let form = tabPanel.formPanel(formCode)
  // Rename Shortcut caption
  form.items.setValueToAttr('test_shortcut1_re', 'caption')
  // Rename Code
  form.items.setValueToAttr('test_code_shotcut1_re', 'code')
  // Click tab 'Shortcut source code'
  form.selectTab('Shortcut source code')
  // Delete one colum from code and click button 'Save and close'. Optional refresh page F5
  form.items.setValueToAttr(`{
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
  form.getFormAction('saveAndClose').click()

  // Reload browser
  await t.navigateTo(TEST_PAGE)
  await loginWindow.load()
  loginWindow.setCredentials('UB', {pwd: 'admin', user: 'admin'})
  loginWindow.loginBtnClick()

  // Select renamed Shortcut on top sidebar menu
  await mainToolbar.load()
  mainToolbar.desktopMenuBtn('test_desktop_code').click()
  mainToolbar.menuItem('test_code_shotcut1_re').click()
})
/*
run commands
testcafe "chrome:headless" Shortcut.js
testcafe chrome Shortcut.js
testcafe --inspect-brk chrome Shortcut.js
testcafe chrome Shortcut.js --screenshots ./screenshots --screenshots-on-fails
*/
