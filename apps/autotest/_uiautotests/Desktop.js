import { extSelector, getWindowError } from './ExtJSHelper/ExtJSSelector'
import { Selector, ClientFunction } from 'testcafe'

const TEST_PAGE = process.env.TEST_PAGE || `http://localhost:888/adm-dev`

fixture(`Preparing data for moving folder and shortcut to Desktop test`)
  .page(TEST_PAGE)

test('Add Desktop', async t => {
  await getWindowError(null)
  // login
  let lw = await extSelector('.ub-login-window')
  lw.loginWin().setValueToUBAuth('admin', 'admin')
  lw.loginWin().loginBtnClick()

  // Open top navbar menu Administrator / UI / Desktops
  let mainMenu = await extSelector('.ub-header-menu-item')
  mainMenu.querySelector('button[text=Administrator][ui=default-toolbar-small]').click()
  mainMenu.querySelector('menuitem[shortcutCode=adm_folder_UI]').showMenu()
  mainMenu.querySelector('menuitem[shortcutCode=ubm_desktop]').click()

  // Click button 'Add'
  let eGrid = await extSelector('.ub-entity-grid')
  let grid = await Selector('.x-grid-view').innerText
  if (grid.indexOf('test_desktop_code') !== -1) {
    await deleteExistDesktop('test_desktop_code')
  }
  eGrid.querySelector('button[actionId=addNew]').click()

  // Fill a field 'Desktop name', Fill a field 'Code', Click button 'Save and close'
  let basepanel = await extSelector('.ub-basepanel')
  basepanel.querySelector('ubtextfield[attributeName=caption]').setValue('test_desktop_name')
  basepanel.querySelector('ubtextfield[attributeName=code]').setValue('test_desktop_code')
  basepanel.querySelector('button[actionId=saveAndClose]').click()

  const e = await t.getBrowserConsoleMessages()
  if (e.error.length > 0) {
    await t.expect(e.error[e.error.length - 1])
      .notContains('UNHANDLED UBError', 'desktop with code test_desktop_code is exists')
  }

  // Verify that new desktop is dispayed on the grid
  await extSelector('.ub-entity-grid')
  let reloadGrid = await Selector('.x-grid-view').innerText
  await t.expect(reloadGrid).contains('test_desktop_code')

  // Relogin to the system
  await t.navigateTo(TEST_PAGE)
  lw = await extSelector('.ub-login-window')
  lw.loginWin().setValueToUBAuth('admin', 'admin')
  lw.loginWin().loginBtnClick()

  // Verify that new Desktop is dispayed on top navbar and on left sidebar's drop-down menu
  mainMenu = await extSelector('.ub-header-menu-item')
  mainMenu.querySelector('button[text=test_desktop_name][ui=default-toolbar-small]').click()
  let leftMenu = await extSelector('.ub-left-panel')
  leftMenu.querySelector('button[cls=ub-desktop-button]').click()
  leftMenu.querySelector('menuitem[text=test_desktop_name]').click()

})

test('Move folder and shortcut to Desktop', async t => {
  await t.navigateTo(TEST_PAGE)
  let lw = await extSelector('.ub-login-window')
  lw.loginWin().setValueToUBAuth('admin', 'admin')
  lw.loginWin().loginBtnClick()

  // check if test folder with shortcut is exist in Administrator desktop
  // if not exist - create or remove
  let leftMenuInnerText = await Selector('.x-tree-view').innerText
  if (leftMenuInnerText.indexOf('Test folder') < 0) {
    await checkPrecondition()
    await t
      .click(Selector('.ub-header-menu-item'))
      .navigateTo(TEST_PAGE)
    let lw = await extSelector('.ub-login-window')
    lw.loginWin().setValueToUBAuth('admin', 'admin')
    lw.loginWin().loginBtnClick()
  }

  // Select existing Folder with Shortcut on sidebar menu
  let mainMenu = await extSelector('.ub-header-menu-item')
  let idMenu = await mainMenu.querySelector('treeview').getIdByAttr('text', 'Test folder')

  // Open folder's context menu and click button 'Edit'
  await t.rightClick(idMenu)
  let leftMenu = await extSelector('.ub-left-panel')
  leftMenu.querySelector('menuitem[text=Edit]').click()

  // Сhange Desktop on "Desktop" drop-down menu
  let shForm = await extSelector('.ub-basepanel')
  shForm.querySelector('ubcombobox[attributeName="desktopID"]').setValue('test_desktop_name')

  // Click button 'Save and close'
  shForm.querySelector('button[actionId=saveAndClose]').click()

  // Reload browser
  await t.navigateTo(TEST_PAGE)
  lw = await extSelector('.ub-login-window')
  lw.loginWin().setValueToUBAuth('admin', 'admin')
  lw.loginWin().loginBtnClick()

  // Switch the Desktop in the left sidebar drop-down menu which the folder was moved
  leftMenu = await extSelector('.ub-left-panel')
  leftMenu.querySelector('button[cls=ub-desktop-button]').click()
  leftMenu.querySelector('menuitem[text=test_desktop_name]').click()

  // Verify that only folder is available on selected Desktop
  let reloadGrid = await Selector('.ub-left-panel').innerText
  await t
    .expect(reloadGrid).contains('Test folder')
    .expect(reloadGrid).notContains('Test shortcut')

  // Select Desktop on top navbar which the folder was moved
  mainMenu = await extSelector('.ub-header-menu-item')
  mainMenu.querySelector('button[text=test_desktop_name][ui=default-toolbar-small]').click()
  mainMenu.querySelector('menuitem[shortcutCode=test_folder]').click()

  // Open top navbar Administrator / UI / Shortcuts
  mainMenu.querySelector('button[text=Administrator][ui=default-toolbar-small]').click()
  mainMenu.querySelector('menuitem[shortcutCode=adm_folder_UI]').showMenu()
  mainMenu.querySelector('menuitem[shortcutCode=ubm_navshortcut]').click()

  // Open shortcut
  let eGrid = await extSelector('.ub-entity-grid')
  let idSht = await eGrid.querySelector('ubtableview').getIdByAttr('code', 'test_shortcut')
  await t.doubleClick(idSht)

  // Select new Desktop on 'Desktop drop-down menu'
  shForm = await extSelector('.ub-basepanel')
  shForm.querySelector('ubcombobox[attributeName="desktopID"]').setValue('test_desktop_name')

  // Click button 'Save and close'
  shForm.querySelector('button[actionId=saveAndClose]').click()

  // Reload browser
  await t.navigateTo(TEST_PAGE)
  lw = await extSelector('.ub-login-window')
  lw.loginWin().setValueToUBAuth('admin', 'admin')
  lw.loginWin().loginBtnClick()

  // Select new Desktop on left sidebar's drop-down menu
  leftMenu = await extSelector('.ub-left-panel')
  leftMenu.querySelector('button[cls=ub-desktop-button]').click()
  leftMenu.querySelector('menuitem[text=test_desktop_name]').click()
  reloadGrid = await Selector('.ub-left-panel').innerText
  await t
    .expect(reloadGrid).contains('Test folder')
    .expect(reloadGrid).contains('Test shortcut')
})

test('Open Desktop details', async t => {
  await t.navigateTo(TEST_PAGE)
  let lw = await extSelector('.ub-login-window')
  lw.loginWin().setValueToUBAuth('admin', 'admin')
  lw.loginWin().loginBtnClick()

  // Open top navbar menu Administrator / UI / Desktops
  let mainMenu = await extSelector('.ub-header-menu-item')
  mainMenu.querySelector('button[text=Administrator][ui=default-toolbar-small]').click()
  mainMenu.querySelector('menuitem[shortcutCode=adm_folder_UI]').showMenu()
  mainMenu.querySelector('menuitem[shortcutCode=ubm_desktop]').click()

  //Select on existing Desktop
  let eGrid = await extSelector('.ub-entity-grid')
  let idSht = await eGrid.querySelector('ubtableview').getIdByAttr('code', 'test_desktop_code')
  await t.rightClick(idSht)

  // Select menu All action / Detail / Shourtcut (Desktop) (on right top side)
  eGrid.querySelector('menuitem[actionId="showDetail"][text="Details"]').showMenu()
  eGrid.querySelector('menuitem[actionId="showDetail"][text="Shortcut (Desktop)"]').click()
  let idDetail = await eGrid.querySelector('tabpanel').getIdByAttr('entityName', 'ubm_navshortcut')
  //  await t.expect(Selector(idDetail).exists).ok(idDetail);
  await t.expect(Selector(idDetail).innerText).contains('test_folder')

  // Select on Administrator desktop
  let idAdm = await eGrid.querySelector('ubtableview').getIdByAttr('code', 'adm_desktop')
  await t.click(Selector(idAdm))

  // Verify that system changed grid of shortcuts on the tab  'Desktop -> Shortcut' and display correct shortcuts
  idDetail = await eGrid.querySelector('tabpanel').getIdByAttr('entityName', 'ubm_navshortcut')
  await t
    .click(Selector(idDetail))
    .expect(Selector(idDetail).innerText).contains('adm_folder_users')

})

function deleteExistDesktop (code) {
  return ClientFunction(code => {
    UB.Repository('ubm_desktop').attrs('ID', 'code').where('code', '=', code)
      .selectAsObject()
      .then(res => {
        $App.connection.query({
          entity: 'ubm_desktop', method: 'delete', execParams: {ID: res[0].ID}
        })
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
      return newFolderData.data[0]
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
      return newFolderData.data[0]
    })
  } else {
    return folder
  }
}

async function checkPrecondition () {
  return ClientFunction(() => {
    return Promise.all([
      UB.Repository('ubm_desktop').attrs('ID', 'code').where('code', '=', 'adm_desktop').selectSingle(),
      UB.Repository('ubm_navshortcut').attrs('ID', 'code', 'desktopID').where('code', '=', 'test_folder').selectSingle(),
      UB.Repository('ubm_navshortcut').attrs('ID', 'code', 'desktopID', 'parentID').where('code', '=', 'test_shortcut').selectSingle()
    ]).then(([desktop, folder, shortcut]) => {
      return insertOrUpdateFolder(desktop, folder).then(newFolder => {
        return {
          desktop, newFolder, shortcut
        }
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
  })()
}

// run commands
// testcafe "chrome:headless" Desktop.js
// testcafe chrome Desktop.js
