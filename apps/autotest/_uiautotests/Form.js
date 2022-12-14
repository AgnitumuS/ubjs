import { ExtSelector } from './ExtJSHelper/ExtJSSelector'
import { getWindowError } from './ExtJSHelper/Preconditions'
import { Selector } from 'testcafe'

const TEST_PAGE = process.env.TEST_PAGE || `http://localhost:8881/ubadminui`

fixture(`Form test`)
  .page(TEST_PAGE)
  .beforeEach(async t => {
    await t.resizeWindow(1200, 800)
  })

test('Check Pure ExtJS Form', async t => {
  await getWindowError(null)
  let ext = new ExtSelector()
  // login
  let loginWindow = ext.loginWindow
  await loginWindow.load()
  await loginWindow.setCredentials('UB', {pwd: 'admin', user: 'admin'})
  await loginWindow.loginBtnClick()

  // Open Administrator / UI / Forms
  let mainToolbar = ext.mainToolbar
  await mainToolbar.load()
  await mainToolbar.desktopMenuBtn('adm_desktop').click()
  await mainToolbar.menuItem('adm_folder_UI').showMenu()
  await mainToolbar.menuItem('ubm_form').click()

  // Open existing Form
  let tabPanel = ext.tabPanel
  await tabPanel.load()
  let gridCode = await tabPanel.loadTabPanelChild('entitygridpanel', {entityName: 'ubm_form'})
  let grid = tabPanel.entityGridPanel(gridCode)
  let ubmDesktopScannerRow = await grid.rows.getIdByAttr('code', 'ubm_desktop-scanerSettings')
  await t.doubleClick(ubmDesktopScannerRow)

  // On the page, should be tab 'Interface's Definition'
  let formParams = {
    entityName: 'ubm_form',
    instanceCode: 'ubm_desktop-scanerSettings',
    isFormConstructor: true
  }
  let formCode = await tabPanel.loadTabPanelChild('basepanel', formParams)
  let form = tabPanel.formPanel(formCode, formParams.isFormConstructor)
  await form.selectTab('formDefinition')
  // Verify that system is display text on the tab
  let rawValue = await form.getFormDefEditorValue()
  await t
    .expect(rawValue).notEql(undefined, 'form does not contain values')

  // On the page, should be tab 'Methods' Definition'
  await form.selectTab('formMethods')
  // Verify that system is display text on the tab
  rawValue = await form.getFormCodeValue()
  await t
    .expect(rawValue).eql('{}', 'form contains an incorrect code')

  // On the page, should be tab 'Visual Designer'
  await form.selectTab('VisualDesigner')
  // Verify that system is NOT allow display text on the tab and show message
  // 'The visual designer do not work with type of this form.'
  let hidden = await form.checkVisualDesignerVisibility()
  let designerText = await form.checkVisualDesignerInnerText()
  if (designerText.substr(-1) === '\n') {
    designerText = designerText.slice(0, -1)
  }
  await t
    .expect(hidden).eql(true, 'Visual designer is visible')
    .expect(designerText).eql('The visual designer do not work with type of this form.'
      , 'Visual designer contains an incorrect code')
})

test('Check UB Form', async t => {
  await getWindowError(null)
  let ext = new ExtSelector()
  // login
  let loginWindow = ext.loginWindow
  await loginWindow.load()
  await loginWindow.setCredentials('UB', {pwd: 'admin', user: 'admin'})
  await loginWindow.loginBtnClick()

  // Open top navbar Administrator / UI / Forms
  let mainToolbar = ext.mainToolbar
  await mainToolbar.load()
  await mainToolbar.desktopMenuBtn('adm_desktop').click()
  await mainToolbar.menuItem('adm_folder_UI').showMenu()
  await mainToolbar.menuItem('ubm_form').click()

  // Open existing Form
  let tabPanel = ext.tabPanel
  await tabPanel.load()
  let gridCode = await tabPanel.loadTabPanelChild('entitygridpanel', {entityName: 'ubm_form'})
  let grid = tabPanel.entityGridPanel(gridCode)
  let ubmDesktop = await grid.rows.getIdByAttr('code', 'ubm_desktop')
  await t.doubleClick(ubmDesktop)
  let formParams = {
    entityName: 'ubm_form',
    instanceCode: 'ubm_desktop',
    isFormConstructor: true
  }
  let formCode = await tabPanel.loadTabPanelChild('basepanel', formParams)
  let form = tabPanel.formPanel(formCode, formParams.isFormConstructor)
  await form.selectTab('formDefinition')
  // Verify that system is display text on the tab
  let rawValue = await form.getFormDefEditorValue()
  await t
    .expect(rawValue).notEql(undefined, 'form does not contain values')

  // On the page, should be tab 'Methods' Definition'
  await form.selectTab('formMethods')
  // Verify that system is display text on the tab
  rawValue = await form.getFormCodeValue()
  await t
    .expect(rawValue).notEql('{}', 'form contains an incorrect code')

  // On the page, should be tab 'Visual Designer'
  await form.selectTab('VisualDesigner')
  // Verify that system is NOT allow display text on the tab and show message
  // 'The visual designer do not work with type of this form.'
  let hidden = await form.checkVisualDesignerVisibility()
  let designerText = await form.checkVisualDesignerInnerText()
  if (designerText.substr(-1) === '\n') {
    designerText = designerText.slice(0, -1)
  }
  await t
    .expect(hidden).eql(false, 'Visual designer is visible')
    .expect(designerText).notEql('The visual designer do not work with type of this form.'
      , 'Visual designer contains an incorrect code')
})

test('Edit Form', async t => {

  // Open menu Administrator/UI/Desktops
  await getWindowError(null)
  let ext = new ExtSelector()
  // login
  let loginWindow = ext.loginWindow
  await loginWindow.load()
  await loginWindow.setCredentials('UB', {pwd: 'admin', user: 'admin'})
  await loginWindow.loginBtnClick()

  // Open top navbar menu Administrator / UI / Desktops
  let mainToolbar = ext.mainToolbar
  await mainToolbar.load()
  await mainToolbar.desktopMenuBtn('adm_desktop').click()
  await mainToolbar.menuItem('adm_folder_UI').showMenu()
  await mainToolbar.menuItem('ubm_desktop').click()

  // Open existing Desktop cdn_desktop
  let tabPanel = ext.tabPanel
  await tabPanel.load()
  let gridCode = await tabPanel.loadTabPanelChild('entitygridpanel', {entityName: 'ubm_desktop'})
  let grid = tabPanel.entityGridPanel(gridCode)
  let cdnDesktopRow = await grid.rows.getIdByAttr('code', 'cdn_desktop')

  await t
    .expect(Selector(cdnDesktopRow).exists).ok('cdn_desktop does not exist, make sure that the CDN model exists in the system')
    .doubleClick(cdnDesktopRow)

  // The system should dispay Desktop editing window in new tab
  let formParams = {
    entityName: 'ubm_desktop',
    instanceCode: 'cdn_desktop',
    instanceAttr: 'code'
  }
  let formCode = await tabPanel.loadTabPanelChild('basepanel', formParams)
  let form = tabPanel.formPanel(formCode)

  // On page, should be field 'URL'
  let urlFieldID = await form.items.getIdByAttr('attributeName', 'url')
  await t.expect(Selector(urlFieldID).exists).ok(`Field URL with id ${urlFieldID} not found on the form`)

  // Close tab 'Deskop'
  await form.closeForm()
  await grid.closeGrid()

  // Open top navbar Administrator / UI / Forms
  await mainToolbar.desktopMenuBtn('adm_desktop').click()
  await mainToolbar.menuItem('adm_folder_UI').showMenu()
  await mainToolbar.menuItem('ubm_form').click()

  // Open existing Form ubm_desktop
  await tabPanel.load()
  gridCode = await tabPanel.loadTabPanelChild('entitygridpanel', {entityName: 'ubm_form'})
  grid = tabPanel.entityGridPanel(gridCode)
  let ubmDesktopRow = await grid.rows.getIdByAttr('code', 'ubm_desktop')
  await t.doubleClick(ubmDesktopRow)
  let editFormParams = {
    entityName: 'ubm_form',
    instanceCode: 'ubm_desktop',
    isFormConstructor: true
  }
  let editFormCode = await tabPanel.loadTabPanelChild('basepanel', editFormParams)
  let editForm = tabPanel.formPanel(editFormCode, editFormParams.isFormConstructor)

  // On the page, should be tab 'Interface's Definition'
  await editForm.selectTab('formDefinition')
  // Verify that system is display text on the tab
  let rawValue = await editForm.getFormDefEditorValue()
  await t
    .expect(rawValue).notEql(undefined, 'form does not contain the values')

  // Remove item { attributeName: "url"}
  let newRawValue = rawValue.replace('{ attributeName: "url"},', '')
  await editForm.setFormDefEditorValue(newRawValue)
  // Click button 'Save'
  await editForm.getFormAction('save').click()
  // Open top navbar menu Administrator / UI / Desktops
  await mainToolbar.load()
  await mainToolbar.desktopMenuBtn('adm_desktop').click()
  await mainToolbar.menuItem('adm_folder_UI').showMenu()
  await mainToolbar.menuItem('ubm_desktop').click()

  // Open existing Desktop cdn_desktop
  gridCode = await tabPanel.loadTabPanelChild('entitygridpanel', {entityName: 'ubm_desktop'})
  grid = tabPanel.entityGridPanel(gridCode)
  cdnDesktopRow = await grid.rows.getIdByAttr('code', 'cdn_desktop')

  await t.doubleClick(cdnDesktopRow)

  // The system should dispay Desktop editing window in new tab
  formParams = {
    entityName: 'ubm_desktop',
    instanceCode: 'cdn_desktop',
    instanceAttr: 'code'
  }
  formCode = await tabPanel.loadTabPanelChild('basepanel', formParams)
  form = tabPanel.formPanel(formCode)

  // On page, should NOT be field 'URL'
  urlFieldID = await form.items.getIdByAttr('attributeName', 'url')
  await t.expect(Selector(urlFieldID).exists).notOk('Field URL is exists on the form')
  // reverse test changes
  await editForm.setFormDefEditorValue(rawValue)
  await editForm.getFormAction('save').click()
})

/*
run commands
testcafe "chrome:headless" Form.js
testcafe chrome Form.js
testcafe --inspect-brk chrome Form.js
*/
