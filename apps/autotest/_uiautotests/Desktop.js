import { ExtSelector } from './ExtJSHelper/ExtJSSelector'
import { deleteExistDesktop, insertDesktop, getWindowError } from './ExtJSHelper/Preconditions'
import { ClientFunction, Selector } from 'testcafe'

const TEST_PAGE = process.env.TEST_PAGE || `http://localhost:888/adm-dev`

fixture(`Preparing data for moving folder and shortcut to Desktop test`)
  .page(TEST_PAGE)

test('Add Desktop', async t => {
  await getWindowError(null)
  let ext = new ExtSelector()
  // login
  let loginWindow = ext.loginWindow
  await loginWindow.load()
  loginWindow.setCredentials('UB', {pwd: 'admin', user: 'admin'})
  loginWindow.loginBtnClick()

  // Open top navbar menu Administrator / UI / Desktops
  let mainToolbar = ext.mainToolbar
  await mainToolbar.load()
  mainToolbar.desktopMenuBtn('adm_desktop').click()
  mainToolbar.menuItem('adm_folder_UI').showMenu()
  mainToolbar.menuItem('ubm_desktop').click()

  // Click button 'Add'
  let tabPanel = ext.tabPanel
  await tabPanel.load()
  let gridCode = await tabPanel.loadTabPanelChild('entitygridpanel', {entityName: 'ubm_desktop'})
  let grid = tabPanel.entityGridPanel(gridCode)
  let testDesktopRow = await grid.rows.getIdByAttr('code', 'test_desktop_code')
  let sel = await Selector(testDesktopRow).exists
  if (sel) {
    deleteExistDesktop('test_desktop_code')
  }
  grid.getGridAction('addNew').click()

  // Fill a field 'Desktop name', Fill a field 'Code', Click button 'Save and close'
  let formCode = await tabPanel.loadTabPanelChild('basepanel', {entityName: 'ubm_desktop'})
  let form = tabPanel.formPanel(formCode)
  form.items.setValueToAttr('test_desktop_name', 'caption')
  form.items.setValueToAttr('test_desktop_code', 'code')
  form.getFormAction('saveAndClose').click()

  // check if form saved without errors
  const e = await t.getBrowserConsoleMessages()
  if (e.error.length) {
    await t.expect(e.error[e.error.length - 1])
      .notContains('UNHANDLED UBError', 'desktop with code test_desktop_code is exists')
  }
  grid.reload()
  // Verify that new desktop is displayed on the grid
  testDesktopRow = await grid.rows.getIdByAttr('code', 'test_desktop_code')
  await t.expect(Selector(testDesktopRow).exists).ok(`Desktop with ${testDesktopRow} id not displayed on grid`)

  // Re-login to the system
  await t.navigateTo(TEST_PAGE)
  await loginWindow.load()
  loginWindow.setCredentials('UB', {pwd: 'admin', user: 'admin'})
  loginWindow.loginBtnClick()

  // Verify that new Desktop is displayed on top navbar and on left sidebar's drop-down menu
  await mainToolbar.load()
  mainToolbar.desktopMenuBtn('test_desktop_code').click()

  let leftPanel = ext.leftPanel
  await leftPanel.load()
  leftPanel.desktopMenuBtn.click()
  leftPanel.selectDesktopMenuItem('test_desktop_code')
})

test('Move folder and shortcut to Desktop', async t => {
  let ext = new ExtSelector()
  // login
  await t.navigateTo(TEST_PAGE)
  let loginWindow = ext.loginWindow
  await loginWindow.load()
  loginWindow.setCredentials('UB', {pwd: 'admin', user: 'admin'})
  loginWindow.loginBtnClick()

  // check if test folder with shortcut is exist in Administrator desktop
  // if not exist - create or remove
  let leftPanel = ext.leftPanel
  await leftPanel.load()
  let testFolderID = await leftPanel.treeItems.getIdByAttr('code', 'test_folder')
  let sel = await Selector(testFolderID).exists
  if (!sel) {
    await checkPrecondition()
    await t.navigateTo(TEST_PAGE)
    await loginWindow.load()
    loginWindow.setCredentials('UB', {pwd: 'admin', user: 'admin'})
    loginWindow.loginBtnClick()
  }

  // Select existing Folder with Shortcut on sidebar menu
  await leftPanel.load()
  let idMenu = await leftPanel.treeItems.getIdByAttr('code', 'test_folder')
  await t.rightClick(idMenu)
  leftPanel.contextMenuItem('Edit').click()
  // Сhange Desktop on "Desktop" drop-down menu
  let baseWindow = ext.baseWindow
  await baseWindow.load()
  baseWindow.modalForm.setValueToAttr('test_desktop_name', 'desktopID')
  // Click button 'Save and close'
  baseWindow.getFormAction('saveAndClose').click()

  // check if form saved without errors
  const e = await t.getBrowserConsoleMessages()
  if (e.error.length) {
    await t.expect(e.error[e.error.length - 1])
      .notContains('UNHANDLED UBError', 'Test forder shortcut was saved with errors')
  }
  // Reload browser
  await t.navigateTo(TEST_PAGE)
  await loginWindow.load()
  loginWindow.setCredentials('UB', {pwd: 'admin', user: 'admin'})
  loginWindow.loginBtnClick()

  // Switch the Desktop in the left sidebar drop-down menu which the folder was moved
  await leftPanel.load()
  leftPanel.desktopMenuBtn.click()
  leftPanel.selectDesktopMenuItem('test_desktop_code')

  // Verify that only folder is available on selected Desktop
  await leftPanel.load()
  testFolderID = await leftPanel.treeItems.getIdByAttr('code', 'test_folder')
  let testShtID = await leftPanel.treeItems.getIdByAttr('code', 'test_shortcut')
  await t
    .expect(Selector(testFolderID).exists).ok(`Folder with id ${testFolderID} is not exist in Test Desktop menu now`)
    .expect(Selector(testShtID).exists).notOk(`Shortcut with id ${testShtID} is exist in Test Desktop menu now`)

  // Select Desktop on top navbar which the folder was moved
  let mainToolbar = ext.mainToolbar
  mainToolbar.desktopMenuBtn('test_desktop_code').click()
  mainToolbar.menuItem('test_folder').click()

  // Open top navbar Administrator / UI / Shortcuts
  mainToolbar.desktopMenuBtn('adm_desktop').click()
  mainToolbar.menuItem('adm_folder_UI').showMenu()
  mainToolbar.menuItem('ubm_navshortcut').click()

  // Open shortcut
  let tabPanel = ext.tabPanel
  await tabPanel.load()
  let gridCode = await tabPanel.loadTabPanelChild('entitygridpanel', {entityName: 'ubm_navshortcut'})
  let grid = tabPanel.entityGridPanel(gridCode)
  let idTestShtRow = await grid.rows.getIdByAttr('code', 'test_shortcut')
  await t.doubleClick(idTestShtRow)

  // Select new Desktop on 'Desktop drop-down menu'
  let formParams = {
    entityName: 'ubm_navshortcut',
    instanceCode: 'test_shortcut',
    instanceAttr: 'code'
  }
  let formCode = await tabPanel.loadTabPanelChild('basepanel', formParams)
  let form = tabPanel.formPanel(formCode)
  form.items.setValueToAttr('test_desktop_name', 'desktopID')

  // Click button 'Save and close'
  form.getFormAction('saveAndClose').click()
  // Reload browser
  await t.navigateTo(TEST_PAGE)
  await loginWindow.load()
  loginWindow.setCredentials('UB', {pwd: 'admin', user: 'admin'})
  loginWindow.loginBtnClick()

  // Select new Desktop on left sidebar's drop-down menu
  await leftPanel.load()
  testFolderID = await leftPanel.treeItems.getIdByAttr('code', 'test_folder')
  testShtID = await leftPanel.treeItems.getIdByAttr('code', 'test_shortcut')
  await t
    .expect(Selector(testFolderID).exists).ok(`Folder with id ${testFolderID} is not exist in Test Desktop menu now`)
    .expect(Selector(testShtID).exists).ok(`Shortcut with id ${testShtID} is not exist in Test Desktop menu now`)
})

test('Open Desktop details', async t => {
  let ext = new ExtSelector()
  // login
  await t.navigateTo(TEST_PAGE)
  let loginWindow = ext.loginWindow
  await loginWindow.load()
  loginWindow.setCredentials('UB', {pwd: 'admin', user: 'admin'})
  loginWindow.loginBtnClick()

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

  // Open top navbar menu Administrator / UI / Desktops
  mainToolbar.desktopMenuBtn('adm_desktop').click()
  mainToolbar.menuItem('adm_folder_UI').showMenu()
  mainToolbar.menuItem('ubm_desktop').click()

  // Select on existing Desktop
  let tabPanel = ext.tabPanel
  await tabPanel.load()
  let gridCode = await tabPanel.loadTabPanelChild('entitygridpanel', {entityName: 'ubm_desktop'})
  let grid = tabPanel.entityGridPanel(gridCode)
  let testDesktopRow = await grid.rows.getIdByAttr('code', 'test_desktop_code')
  await t.click(Selector(testDesktopRow))
  // Select menu All action / Detail / Shourtcut (Desktop) (on right top side)
  grid.selectAllActionMenuItem({actionID: 'showDetail', entityName: 'ubm_navshortcut'})
  gridCode = await tabPanel.loadTabPanelChild('entitygridpanel', {entityName: 'ubm_navshortcut'})

  // Select on Administrator desktop
  let admDesktopRow = await grid.rows.getIdByAttr('code', 'adm_desktop')
  await t.click(Selector(admDesktopRow))
  let detailGrid = tabPanel.entityGridPanel(gridCode)
  await detailGrid.reload()
  let detailGridRow = await detailGrid.rows.getIdByAttr('code', 'uba_user')
  await t.expect(Selector(detailGridRow).exists).ok(`Row with ${detailGridRow} id not displayed on grid`)
})

test('Delete Desktop', async t => {
  let ext = new ExtSelector()
  // login
  await t.navigateTo(TEST_PAGE)
  let loginWindow = ext.loginWindow
  await loginWindow.load()
  loginWindow.setCredentials('UB', {pwd: 'admin', user: 'admin'})
  loginWindow.loginBtnClick()

  // Open top navbar menu Administrator / UI / Desktops
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

  mainToolbar.desktopMenuBtn('adm_desktop').click()
  mainToolbar.menuItem('adm_folder_UI').showMenu()
  mainToolbar.menuItem('ubm_desktop').click()

  // Open context menu from existing Desktop and click 'Delete'
  let tabPanel = ext.tabPanel
  await tabPanel.load()
  let gridCode = await tabPanel.loadTabPanelChild('entitygridpanel', {entityName: 'ubm_desktop'})
  let grid = tabPanel.entityGridPanel(gridCode)
  let idTestDesktopRow = await grid.rows.getIdByAttr('code', 'test_desktop_code')
  await t.rightClick(idTestDesktopRow)
  await grid.selectContextMenuItem({actionID: 'del'})

  // Click on button 'NO'
  let messageBox = ext.messagebox
  await messageBox.selectAction('no')

  // Verify that system closed confirmation message and Desktop is present
  await t
    .expect(Selector('messagebox').exists).notOk('The message window is not closed')
    .expect(Selector(idTestDesktopRow).exists).ok('The desktop with code "test_desktop_code" was deleted')

  // Open context menu from existing Desktop and click 'Delete'
  await t.rightClick(idTestDesktopRow)
  grid.selectContextMenuItem({actionID: 'del'})

  // Click on button 'YES'
  await messageBox.selectAction('yes')
  // Verify that system closed confirmation message and Shortcut is deleled
  await t
    .expect(Selector('messagebox').exists).notOk('The message window is not closed')
    .expect(Selector(idTestDesktopRow).exists).notOk('The desktop with code "test_desktop_code" was`nt deleted')

  // Reload browser
  await t.navigateTo(TEST_PAGE)
  await loginWindow.load()
  loginWindow.setCredentials('UB', {pwd: 'admin', user: 'admin'})
  loginWindow.loginBtnClick()

  desktopID = await mainToolbar.desktopMenuBtn('test_desktop_code').getIdByAttr()
  await t.expect(Selector(desktopID).exists).notOk('The desktop with code "test_desktop_code" was`nt removed from navbar')
})

test('All actions - Details (Not selected item)', async t => {
  let ext = new ExtSelector()
  // login
  await t.navigateTo(TEST_PAGE)
  let loginWindow = ext.loginWindow
  await loginWindow.load()
  loginWindow.setCredentials('UB', {pwd: 'admin', user: 'admin'})
  loginWindow.loginBtnClick()

  // Open top navbar menu Administrator / UI / Desktops
  let mainToolbar = ext.mainToolbar
  await mainToolbar.load()
  mainToolbar.desktopMenuBtn('adm_desktop').click()
  mainToolbar.menuItem('adm_folder_UI').showMenu()
  mainToolbar.menuItem('ubm_desktop').click()

  // Click "All actions" on the right corner, select  "Details" and click "Shortcut (Desktop)"
  let tabPanel = ext.tabPanel
  await tabPanel.load()
  let gridCode = await tabPanel.loadTabPanelChild('entitygridpanel', {entityName: 'ubm_desktop'})
  let grid = tabPanel.entityGridPanel(gridCode)
  grid.selectAllActionMenuItem({actionID: 'showDetail', entityName: 'ubm_navshortcut'})

  // Click "Ok"
  let messageBox = ext.messagebox
  await messageBox.selectAction('ok')
})

function insertOrUpdateFolder (desktop, folder) {
  if (!folder) {
    return $App.connection.query({
      entity: 'ubm_navshortcut',
      method: 'insert',
      fieldList: ['ID', 'code', 'desktopID'],
      execParams: {
        desktopID: desktop.ID,
        code: 'test_folder',
        caption: 'Test folder',
        isFolder: true
      }
    }).then(newFolderData => {
      return {ID: newFolderData.resultData.data[0][0]}
    })
  } else if (folder.desktopID !== desktop.ID) {
    return $App.connection.query({
      entity: 'ubm_navshortcut',
      method: 'update',
      fieldList: ['ID', 'code', 'desktopID'],
      __skipOptimisticLock: true,
      execParams: {
        ID: folder.ID,
        desktopID: desktop.ID
      }
    }).then(newFolderData => {
      return {ID: newFolderData.resultData.data[0][0]}
    })
  } else {
    return Promise.resolve(folder)
  }
}

async function checkPrecondition () {
  await ClientFunction(() => {
    return Promise.all([
      UB.Repository('ubm_desktop').attrs('ID', 'code').where('code', '=', 'adm_desktop').selectSingle(),
      UB.Repository('ubm_navshortcut').attrs('ID', 'code', 'desktopID').where('code', '=', 'test_folder').selectSingle(),
      UB.Repository('ubm_navshortcut').attrs('ID', 'code', 'desktopID', 'parentID').where('code', '=', 'test_shortcut').selectSingle()
    ]).then(([desktop, folder, shortcut]) => {
      return insertOrUpdateFolder(desktop, folder).then(newFolder => {
        return Promise.resolve([desktop, newFolder, shortcut])
      })
    }).then(([desktop, folder, shortcut]) => {
      if (!shortcut) {
        return $App.connection.query({
          entity: 'ubm_navshortcut',
          method: 'insert',
          fieldList: ['ID'],
          execParams: {
            desktopID: desktop.ID,
            code: 'test_shortcut',
            caption: 'Test shortcut',
            parentID: folder.ID,
            isFolder: false
          }
        })
      } else if (shortcut.desktopID !== desktop.ID || shortcut.parentID !== folder.ID) {
        return $App.connection.query({
          entity: 'ubm_navshortcut',
          method: 'update',
          fieldList: [],
          __skipOptimisticLock: true,
          execParams: {
            ID: shortcut.ID,
            desktopID: desktop.ID,
            parentID: folder.ID
          }
        })
      }
    })
  }, {
    dependencies: {insertOrUpdateFolder}
  })()
}


/*
run commands
testcafe "chrome:headless" Desktop.js
testcafe chrome Desktop.js
testcafe --inspect-brk chrome Desktop.js
testcafe chrome Desktop.js --screenshots ./screenshots --screenshots-on-fails
*/
