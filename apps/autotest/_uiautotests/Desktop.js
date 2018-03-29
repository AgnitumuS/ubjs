import { ExtSelector, getWindowError } from './ExtJSHelper/ExtJSSelector'
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

  // Open top navbar menu Administrator / UI / Desktops
  let mainToolbar = ext.mainToolbar
  await mainToolbar.load()
  mainToolbar.desktopMenuBtn('adm_desktop').click()
  mainToolbar.menuItem('adm_folder_UI').showMenu()
  mainToolbar.menuItem('ubm_desktop').click()

  // Select on existing Desktop
  let tabPanel = ext.tabPanel
  await tabPanel.load()
  let gridCode = await tabPanel.loadTabPanelChild('entitygridpanel', {entityName: 'ubm_desktop'})
  let grid = tabPanel.entityGridPanel(gridCode)
  let testDesktopRow = await grid.rows.getIdByAttr('code', 'test_desktop_code')
  let sel = await Selector(testDesktopRow).exists
  // insert desktop if not exist and reload page
  if (!sel) {
    await insertDesktop('test_desktop_code', 'test_desktop_name')
    await tabPanel.load()
    await t.navigateTo(TEST_PAGE)
    await loginWindow.load()
    loginWindow.setCredentials('UB', {pwd: 'admin', user: 'admin'})
    loginWindow.loginBtnClick()
    await mainToolbar.load()
    mainToolbar.desktopMenuBtn('adm_desktop').click()
    mainToolbar.menuItem('adm_folder_UI').showMenu()
    mainToolbar.menuItem('ubm_desktop').click()
    await tabPanel.load()
    gridCode = await tabPanel.loadTabPanelChild('entitygridpanel', {entityName: 'ubm_desktop'})
    grid = tabPanel.entityGridPanel(gridCode)
    testDesktopRow = await grid.rows.getIdByAttr('code', 'test_desktop_code')
  }
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

async function deleteExistDesktop (code) {
  await ClientFunction(code => {
    UB.Repository('ubm_desktop').attrs('ID', 'code').where('code', '=', code)
      .selectAsObject()
      .then(res => {
        $App.connection.query({
          entity: 'ubm_desktop', method: 'delete', execParams: {ID: res[0].ID}
        }).then(res => { return res })
      })
  })(code)
}

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

async function insertDesktop (code, caption) {
  await ClientFunction((code, caption) => {
    UB.Repository('ubm_desktop').attrs('ID', 'code').where('code', '=', code)
      .selectSingle()
      .then(res => {
        if (!res) {
          $App.connection.query({
            entity: 'ubm_desktop',
            method: 'insert',
            fieldList: ['ID', 'code', 'caption'],
            execParams: {
              code: code,
              caption: caption
            }
          }).then(res => { return res })
        }
      })
  })(code, caption)
}

/*
run commands
testcafe "chrome:headless" Desktop.js
testcafe chrome Desktop.js
testcafe --inspect-brk chrome Desktop.js
*/
