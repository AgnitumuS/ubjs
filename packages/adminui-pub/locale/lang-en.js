/* global Ext UB */
/*
This file is part UnityBase Ext-based client
Copyright (c) 2014 InBase
*/
/**
 * English translation
 */
UB.i18nExtend({
  doYouWantLogoutFromExternalServer: 'End the session at the authorization center?',
  emptyBarcodeSettings: 'You must set barcode settings, before use it.',
  setScannerSettings: 'You must set scanner settings, before use it. Scanner settings are <a href="/" onclick="{0} return false;">here</a>.',
  showResultConfig: 'Show configuration',
  numberOfSignificantDigits: 'The number of significant digits exceeds the allowable',
  yearShort: 'y.',
  PastTooLargeText: 'You perform the insertion of a large volume. This operation may take a long time. Do you want to continue?',
  gridOptimizeWidth: 'Autofit',
  showDeveloperDetail: 'Details for developer',
  pleaseInputValueToThisField: 'fill value',
  Audit: 'Audit',
  gridEmptySelection: 'Not selected entry in the grid.',
  gridItemLink: 'Item link',
  gridCategoryCaption: 'Category',
  gridFavoritesCaption: 'Favorites',
  info: 'Information',
  uk: 'Ukrainian',
  en: 'English',
  ru: 'Russian',
  az: 'Azerbaijani',
  tg: 'Tajik',
  id: 'Indonesian',
  ka: 'Georgian',
  ky: 'Kyrgyz',
  login: 'Login',
  requiredField: 'This field is required',
  General: 'General',
  missingDescriptionAttribute: '"Description attribute property" "{0}" for entity "{1}" point to missed attribute',
  userSettings: 'Settings',
  Desktop: 'Desktop',
  unknownCommand: 'Unknown command',
  unknownCommandType: 'Unknown command type',
  unknownEntityInCommand: 'Incorrect definition for  "{0}" command. Entity attribute is invalid. "{1}" entity is not found.',
  Entity: 'Entity',
  Copy: 'Copy',
  Edit: 'Edit',
  Delete: 'Delete',
  allActions: 'All actions...',
  saveAndClose: 'Save and close',
  storedData: 'Stored data',
  resetGUIToDefault: 'Reset GUI settings',
  clearLocalStore: 'Clear local store',
  novajaVersija: 'New version',
  aktualnoS: 'Starting at',
  refresh: 'Refresh',
  obrazDocumenta: 'Document image',
  link: 'Link',
  External: 'External',
  ChangesHistory: 'Changes history',
  Details: 'Details',
  Filter: 'Filter',
  s: 'from',
  po: 'till',
  pluginNeUstanovlen: "Plugin isn't installed",
  pluginNedostupen: 'Plugin is disabled',
  nastroykiSkanera: "Scanner's settings",
  skanirovat: 'Scan',
  skanirovanieAtributa: 'Scanning of attribute',
  izFayla: 'From file',
  shtrikhKod: 'Barcode',
  dokument: 'Document',
  fayl: 'File',
  pleaseWait: 'Please Wait...',
  loadingData: 'Loading data...',
  zagruzka: 'Uploading...',
  emptyContent: "Content isn't set",
  vyHotiteUdalitSoderzhimoeDocumenta: 'Do you really want to delete the contents of the document?',
  vyberiteFayl: 'Select file',
  dobavlenie: 'creating',
  serverVremennoNedostupen: 'The server is temporary unavailable. Please try again later or contact your system administrator.',
  deletionDialogConfirmCaption: 'Confirm delete',
  deleteConfirmation: "Record will be deleted from the '{0}'. Are You sure?",
  deleteConfirmationWithCaption: "Record {1} will be deleted from the '{0}'. Are You sure?",
  deleteFormConfirmCaption: "Will be deleted '{0}'. Are You sure?",
  rowEditing: 'Need to complete editing data',
  notValidForColumns: 'Invalid values in columns {0}',
  vyUvereny: 'Are You sure?',
  formDefinition: "Interface's definition",
  formModule: "Methods' definition",
  err_line: 'Line',
  err_character: 'Character',
  err_description: 'Description',
  konsolOshibok: 'Error console',
  accessRight: 'Access rights',
  vybrat: 'Select',
  redactirovat: 'Edit shortcut',
  addShortcut: 'Add shortcut',
  addFolder: 'Add folder',
  showPreview: 'Show preview',
  exportXls: 'Export to "Excel"',
  exportCsv: 'Export to CSV',
  'export': 'Export',
  currentPageNumber: 'Current page',
  persistLockInfo: 'You was set permanent lock at {1}',
  softLockInfo: 'The record was locked by user "{0}" at {1}',
  'Record locked by another user': 'Record locked by another user',
  lockBtn: 'Lock record',
  unLockBtn: 'Unlock record',
  tempSoftLockInfo: 'The record now is edited by user "{0}"',
  recordLockedOtherUser: 'Record is locked by another user',
  recordLockedThisUser: 'Record is already locked',
  lockSuccessCreated: 'Record successfully locked',
  recordLockedByTempLock: 'Record is currently being edited by another user',
  recordLockedThisUserByTempLock: 'Record is currently being edited by current user',
  lockSuccessDeleted: 'Record successfully unlocked',
  recordNotLocked: 'Record not locked',
  tempLockExistForThisUser: 'The current user is currently editing an entry in another tab or window on another computer does',

  nodeTemplateNotFound: 'Template "{0}" for node type {1} not found',
  da: 'Yes',
  net: 'No',
  showLetters: 'Show symbols',
  original: 'Original',
  tabsCountLimitExceeded: 'Too many tabs open',
  unsavedData: 'Unsaved data',
  confirmFormClosing: 'The changes were not saved. Close form <b>with the loss of the changes made</b>?',
  confirmSave: 'Do you want to save changes?',
  ot: ' of ',
  'do': ' to ',
  document: 'document',
  sign: 'Sign',
  clear: 'Clear',

  NMUBExtension: 'extension "UBExtension"',
  NMFeatureScanner: 'Scanner support module',
  NMFeatureDSTU: 'DSTU cryptography module',
  NMFeatureIIT: 'IIT cryptography module',
  NMFeaturePDFSigner: 'PDF signing module',
  singOperationInProcess: 'The system performs the signing of another document. Try again later',

  // all messages below are formatted with 4 params [0=UB.i18n(featureInfo.UIName), 1=featureInfo.minVersion, 2=currentVersion, 3=installerDownloadPath]
  NMInstallExtensionFirefox: '<p>To use this application Firefox extension <b>"UBExtension"</b> must be installed.</p> ' +
    '<p>Follow <a href="https://addons.mozilla.org/addon/ub-extension/" target="_blank">ADD EXTENSION</a> ' +
    ' to go to the Firefox add-ons</p>' +
    '<p> At the add-on window click button <b>+Add to Firefox</b></p>' +
    '<p>Confirm adding a new extension.</p>' +
    '<p>After installing the extension <b>restart your browser!</b></p>',
  NMInstallExtensionChrome: '<p>To use this application Chrome extension <b>"UBExtension"</b> must be installed.</p> ' +
        '<p>Follow <a href="https://chrome.google.com/webstore/detail/ubextension/{3}" target="_blank">ADD EXTENSION</a> ' +
        ' to go to the Google store</p>' +
        '<p> At the store windows click button <img src="models/adminui-pub/ub-extension/ChromePlusFreeEn.png"/> (may be <b>+FREE</b>)</p>' +
        '<p>When window with confirmation for extension installation - click "Add".</p>' +
        '<p>Extension will be installed and button <b>+FREE</b> changes his color to green: <img src="models/adminui-pub/ub-extension/ChromeAddedEn.png"/> ' +
        '<p>After installing the extension <b>restart your browser!</b></p>',
  NMInstallExtensionOpera: '<p>To use this application Opera extension <b>"UBExtension"</b> must be installed.</p> ' +
        '<p>Follow <a href="models/adminui-pub/ub-extension/UBExtension.crx" target="_blank">DOWNLOAD EXTENSION</a> link.</p>' +
        '<p>After extension is downloaded you can see "unknown source" warning in the upper part of your Opera browser. ' +
        'Press "Go" button on the message bar - Opera open extension page. On this page you must found "UBExtension" and press "Install" button twice</p> ' +
        '<p>After this installation is complete and better to restart your browser.</p>',
  NMUpdateExtensionChrome: '<p>To continue you need to update your browser<b>{0}</b> up to version <i>{2}</i>.</p> ' +
        '<p>Usually Google Chrome updating extensions automatically. Try to close/open browser. ' +
        ' For manually updating go to the Google store<a href="https://chrome.google.com/webstore/detail/ubextension/{3}" target="_blank">and follow this link</a> </p>',
  NMUpdateExtensionOpera: '<p>The new version <i>{2}</i> of the <b>{0}</b> is available and should be installed.</p> ' +
        'Read <a href="models/adminui-pub/ub-extension/extensionUpdateInstructionOpera.html" target="_blank">update instruction</a> ' +
        ' and follow <a href="https://chrome.google.com/webstore/detail/ubextension/{3}" target="_blank">UPDATE</a>. <p>After update is complete - restart your browser.</p>',
  NMInstallFeature: '<p>To use this feature <b>{0}</b> must be installed.</p> ' +
        '<p>Follow <a href="{3}" target="_blank">DOWNLOAD SETUP</a>. After download is complete, run the install and follow the prompts.</p>' +
        '<p>After the installation is complete, restart your browser.</p>',
  NMUpdateFeature: '<p>The new version <i>{1}</i> of the application <b>{0}</b> is available and should be installed.</p> ' +
        '<p>Follow <a href="{3}" target="_blank">DOWNLOAD UPDATE SETUP</a>. After the download is complete, run the install and follow the prompts.</p>' +
        '<p>After the update is complete, restart your browser.</p>',

  signed: 'Signed',
  term: 'Term',
  executed: 'Executed',
  linkToDocItem: 'Link to document item',
  filter: 'Filter',
  doubletAlertTitle: 'Document doublets',
  doubletAlertMsg: 'There are doublets of this document: {0}. Do you want to continue?',
  barcodeRegData: '{0} from {1}',
  barcodeSheets: 'sht.{0}',
  withoutNumber: 'W/N',
  withoutDate: 'W/D',
  partialDataLoaded: 'Partial data loaded',
  include: ' include',
  tooManyItems: 'Too many items. Please try to refine your search.',
  fetchAllRows: 'Download all',
  rowCounts: 'Rows',
  doNotGetLock: 'Record was locked by  {0} {1} sec. ago. It\'s read-only for you now',
  resolutionSignReason: 'Resolution was signed',
  forms: 'forms',
  Forms: 'Forms',
  noStaffEmployeeShortFIO: 'Not assigned',
  made: 'Made',
  notSpecified: 'Not specified',
  searchOpportunities: 'Search Opportunities',
  searchOpportunitiesInfo: [
    'Exact: abc',
    'Start with: <b>abc*</b>',
    'Any match: <b>*abc*</b>'
  ].join('<br>'),
  numericSearchOpportunitiesInfo: [
    'Equal: 123',
    'More then: &gt;123',
    'Less then: &lt;123'
  ].join('<br>'),
  today: 'Today',
  no_filter: 'No filters',
  yesterday: 'Yesterday',
  current_week: 'Current week',
  this_month: 'This month',
  this_year: 'This year',
  date: 'On date',
  period: 'Period',
  from_date: 'From date',
  to_date: 'To date',
  attachments: 'Attachments',
  areYouSure: 'Are you sure?',
  formWasChanged: 'Form was changed. Are you sure want to refresh and discard changes?',
  addresses: 'Addresses',
  recStage: 'Reconciliation stage',
  route: 'Route',
  executorTemplateFormTitle: 'Executors template',
  amount: 'Amount',
  documentStatus: 'Document status',
  tasks: 'Tasks',
  day: 'Day',
  woNumber: 'Without number',
  documents: 'Documents',
  mainExecutor: 'Main executor',
  coExecutor: 'Coexecutor',
  forInfo: 'For info',
  control: 'Control',
  signers: 'Signed',
  producers: 'Produced',
  summary: 'Summary',
  comment: 'Comment',
  itemdot: 'I.',
  byTemplate: 'By template',
  register: 'Register',
  signAction: 'Sign',
  errNoResSigner: 'Signer of resolution is not specified',
  sendOutDoc: 'Send',
  sucSendingMsgTitle: 'Document has been sent successfully',
  sucSendingMsg: 'Document has been sent to SEV successfully',
  archive: 'Archive',
  importDoc: 'Import document',
  sucImportMsgTitle: 'Document has been import successfully',
  sucImportMsg: 'Document has been import from SEV successfully',
  filterType: 'Filter type',
  permits: 'Permits',
  analyticDesktop: 'Analytic desktop',
  validFrom: 'Valid from',
  validTo: 'Valid to',
  organization: 'Organization',
  email: 'E-Mail',
  name: 'Name',
  issued: 'Issued',
  documentWasChangedSinceSign: 'The document was changed  since it was signed',
  documentWasUnchangedSinceSign: 'The document was unchanged  since it was signed',
  failedToVerifySignature: 'Failed to verify signature, because the parent certificate is not available',
  notValidCertificate: 'This certificate is not valid',
  notTrustedCertificate: 'This certificate and it\'s parent certificates are not trusted',
  unknownSigner: 'This signer is unknown',
  successfullCertificateValidation: 'Certificate verified successfully',
  clockOnSignerComputer: 'The time of signature was saved in accordance with the clock on signer\'s computer',
  cannotVerifyTimeStamp: 'Signature has timestamp, but it cannot be verified',
  verificationResult: 'Verification result',
  reason: 'Reason',
  location: 'Location',
  author: 'Author',
  signVerification: 'Sign verification',
  signsInDocument: 'Signs',

  search: 'Search',
  'Filter by': 'Filter by',
  filterForm: 'Search form',
  main: 'Main',
  other: 'Other',
  showPreFilter: 'Show search form',
  editSelItem: 'Edit selected element',
  addNewItem: 'Add new element',
  selectFromDictionary: 'Select from the dictionary',
  clearSelection: 'Clear selection',
  isRequiredTip: 'It is required',
  isMultilangTip: 'Values for other languages',
  calcRowCount: 'Count the number of rows',
  totalRowCount: 'The total number of lines',

  isNull: 'Empty',
  by_value: 'Equal',
  by_several_value: 'Multiple',
  more: 'more than',
  less: 'less than',
  equal: 'equal',
  range: 'range',
  contains: 'contains',
  startWith: 'starting with',
  notEqual: 'not equal',
  notContains: 'not contains',
  attention: 'Attention',
  doNotSelectedConfigName: 'No configuration is selected',
  load: 'Load',
  save: 'Save',
  apply: 'Apply',
  doNotSave: "Don't Save",
  fDelete: 'Delete',
  configurationName: 'Configuration',
  deleteConfirm: 'Do you really want to delete configuration?',
  filterWasChangedConfirm: 'Filter was changed. After loading the configuration, all changes will be lost. Continue?',
  filterIsRequired: 'The filter is required',
  navShortcutCode: 'Shortcut source code',
  navShortcutRights: 'Shortcut rights',
  storageFrmCaption: 'Storage settings',
  storageFrmKeys: 'Keys',
  storageFrmPass: 'Password',
  storageFrmPath: 'Storage path',
  storageFrmBadSorage: 'Invalid password or storage path',
  entityLockedOwn: 'Locked on',
  changedByAnotherUserForLock: 'During the viewing of the document, it has been changed by another user. Open the document again to start editing mode exclusive lock',

  moreThanOneUserWithPassedCertificate: 'There are more than one user with passed certificate. Please, enter the user name/',

  headerSelectCert: 'Select certificate',
  headerSelectOwnCert: 'Select certificate for private key',
  invalidPrivateKeyCertificateSelection: 'For signing operation user key storage must contain only one certificate. Contact your system administrator.',

  actionDelete: 'Delete',
  actionAdd: 'Add',
  captionCert: 'Certificate',
  actionSelect: 'Select',
  actionCancel: 'Cancel',
  btnIItSttings: 'IIT settings form',
  btnIItCert: 'IIT certificates form',
  cases: 'Cases',
  nameInGen: 'Name in genitive',
  nameInDat: 'Name in dative',
  fullNameInGen: 'Full name in genitive',
  fullNameInDat: 'Full name in dative',
  Language: 'Language',
  showDocVersions: 'Previous revisions',
  selectDocRevision: 'Choose revision:',
  isLastDocRevision: '(current)',
  formShowDocRevisions: 'Document revisions',
  onlyCurrentVersionExists: 'Only current revision exists',
  revisionNum: 'Revision #',
  downloadAttach: 'Download',
  editMultiLang: 'In other languages',

  print: 'print',
  generalInfo: 'General info',
  sexType: 'Gender',
  lastName: 'Last name',
  firstName: 'First name',
  middleName: 'Middle name',
  additionalInfo: 'Additional info',
  birthDate: 'Birthday',
  shortFIO: 'Short name',
  fullFIO: 'Full name',
  identificationCode: 'Identification code',
  identificationCodeShort: 'IIC',
  appeal: 'Appeal',
  appealToPerson: 'Appeal to person',
  user: 'User',
  userOfSystem: 'Application user',
  enterCommentForRecord: 'Enter comment for record',
  documentNotFound: 'Data not found. Please, contact your system administrator.',
  showAudit: 'Audit',

  noPaperInScanner: 'Scanner tray is empty or scanner is not properly configured. Add paper in the tray and press OK.',
  doYouWantResume: 'Scan more pages?',
  scan: 'Scan',

  doScanPages: 'Scanned page {0}',
  doRecognizePages: 'Recognizing page num. {0}',
  doRecognizeDocument: 'Recognizing document ...',
  ScannerNotConfigured: 'Scanner is not found on your computer or not properly configured in your system',
  doStartScan: 'Request to the scanner ...',
  doFinishScan: 'Obtaining scanning results',

  serverIsBusy: 'Server currently unavailable',
  ubErrRecordmodified: 'Since the opening of data they have been changed by another user. For obtaining actual data click "Update" button.',
  doYouWantFillOtherAttr: 'Are you sure to fill other attributes for {0} in dictionary "{1}"?',
  comboBoxSaveDictItem: 'Save to dictionary',

  selectFtsConnection: 'Search area',
  ftsConnectionftsDefault: 'Common',
  ftsConnectionftsSubjectSearch: 'Subject',
  ftsFieldCaption: 'Caption',
  ftsFieldSnippet: 'Results',
  fullTextSearchWidgetResultTitle: 'Full text search result on query <b>{0}</b>',
  ftsTextFieldLabel: 'Query',
  ftsChkFilterPeriod: 'Filter period',
  ftsSearchGroup: 'Full text search',
  ftsFilterName: 'Full text search: {0}',
  fullTextSearchInfo: 'Full text search on all data that were included in the search index. How to use ...',
  informationHeader: 'Information',
  elementIsNotActual: 'Item is not actual to the current date.',

  selectPeriod: 'Select period',
  periodType: 'Period',
  periodNone: 'For all time',
  periodDate: 'Day',
  periodChkTwoDay: 'Few days',
  periodMonth: 'Month',
  periodYear: 'Year',
  periodChkTwoMonth: 'Few months',
  periodChkTwoYear: 'Few years',

  emptyPeriod: 'For all time',

  close: 'Close',
  closeOther: 'Close other tabs',
  closeInactive: 'Close inactive',
  closeAll: 'Close all',
  dropZoneOneFileRequired: 'One file required for this operation',
  dropZoneReplace: 'Replace',
  dropZoneAdd: 'Add',
  dropZoneOperationComplete: 'File successfully attached',
  Transformation: 'Ttransformation',

  showPlanAndFact: 'Show plan and fact',

  'error': 'Error',
  'detail': 'Detail',
  'exportHtml': 'Export to Html',
  'respDepartment': 'Resp. department',
  'respExecutor': 'Resp. executor',
  'formConstructor': 'Form constructor',
  'isAutoGeneratedForm': 'This form was generated automatically',
  'formNotFound': 'Form not found',
  'startSearchMinCharacters': 'Min character quantity for search: {0}',
  OpenIDConnect: 'OpenID',
  authOpenIDConnectFail: "OpenID provider can't authorize your request",
  'readPKCanceled': 'Canceled by user',
  'invalidPrivateKeyCertificate': 'Choose wrong private key sertificate(s). For key after 2014 you nedd to have 2 sertificates.',
  'menu': 'Menu',
  'ubErrLockedbyanotheruser': 'Record is locked by another user. Changes cannot be saved. Try again later.',
  'showFilterPanel': 'Filter',
  'mi_dateFrom': 'Date from',
  'mi_dateTo': 'Date to',
  'mi_modifyDate': 'Last modified',
  'mi_createDate': 'Created',
  'countST': 'Record count',
  'sumST': 'Sum',
  'maxST': 'Max value',
  'minST': 'Min value',
  'avgST': 'Average value',
  'selectedElements': 'Selected elements',
  'allElements': 'All elements',
  'selectElements': 'Select items',
  'selectAll': 'Select all',
  'selectAllOnPage': 'Select all on page',
  'preViewInPDF': 'Preview in PDF',
  'ubErrTheServerHasExceededMaximumNumberOfConnections': 'Server has exceed  maximum number of connections',
  'ubErrFtsForAppDisabled': 'fts for application is disabled',
  UbPreFilterMainGroup: 'by attributes',

  // mxGraph (org chart)
  'Undo': 'Undo',
  'Redo': 'Redo',
  'Zoom': 'Zoom',
  'Zoom Out': 'Zoom Out',
  'Actual Size': 'Actual Size',
  'Print': 'Print',
  'Poster Print': 'Poster Print',
  'Enter maximum page count': 'Enter maximum page count',
  'Select': 'Select',
  'Pan': 'Pan',
  'Select all': 'Select all',
  'New organizational chart': 'New organizational chart',
  'Create child': 'Create child',
  'Open subordinate chart from this node': 'Open subordinate chart from this node',
  'Remove all child': 'Remove all child',
  'Select all child': 'Select all child',
  'Align child to right': 'Align child to right',
  'Align child down me': 'Align child down me',
  'Format edge top to bottom': 'Format edge top to bottom',
  'Format edge left to right': 'Format edge left to right',
  'Format edge orthogonal': 'Format edge orthogonal',
  'Fit': 'Fit',
  'Overview': 'Overview',
  'Organization': 'Organization',
  'Collapse': 'Collapse',
  'Expand': 'Expand',
  'Append element': 'Append element',
  'Root is not found': 'Root is not found',
  'A4 portrait': 'A4 portrait',
  'A4 landscape': 'A4 landscape',
  'A5 portrait': 'A5 portrait',
  'A5 landscape': 'A5 landscape',
  'Chart for this item does not exist. Create a new one?': 'Chart for this item does not exist. Create a new one?',
  // mxGraph (ER-diagram)
  'toolbar': 'toolbar',
  'entities': 'entities',
  AsTable: 'AsTable',
  'AsJSON': 'AsJSON',
  'Attributes': 'Attributes',
  'code': 'code',
  'caption': 'caption',
  'dataType': 'dataType',
  'size': 'size',
  'associatedEntity': 'associatedEntity',
  'accessType': 'accessType',
  'allowNull': 'allowNull',
  'isUnique': 'isUnique',
  'defaultValue': 'defaultValue',
  'allowSort': 'allowSort',
  'Mixins': 'Mixins',
  'enabled': 'enabled',

  dateIsTooEarly: 'The date must be greater than {0}',

  quickAccessButtons: 'Quick access buttons',

  showFullScreen: 'Show full screen',

  // !!!
    // Do not change this last item.
    // Put your new items before EOF for SVN auto merge reason.
  EOF: 'EOF'

})

/**
 * Define missing english date format settings
 * By mpv (utf-8 encoding)
 */
if (typeof Ext !== 'undefined') {
  Ext.onReady(function () {
    if (Ext.Updater) {
      Ext.Updater.defaults.indicatorText = '<div class="loading-indicator">Loading...</div>'
    }
    if (Ext.view.View) {
      Ext.view.View.prototype.emptyText = '&lt List is empty&gt'
    }

    if (Ext.grid.Panel) {
      Ext.grid.Panel.prototype.ddText = '{0} row(s) selected'
    }

    if (Ext.TabPanelItem) {
      Ext.TabPanelItem.prototype.closeText = 'Close this tab'
    }

    if (Ext.form.field.Base) {
      Ext.form.field.Base.prototype.invalidText = 'This field contains a wrong value'
    }

    if (Ext.LoadMask) {
      Ext.LoadMask.prototype.msg = 'Loading...'
      Ext.LoadMask.msg = 'Loading...'
    }

    if (Ext.Date) {
      Ext.Date.monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ]

      Ext.Date.shortMonthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
      ]

      Ext.Date.getShortMonthName = function (month) {
        return Ext.Date.shortMonthNames[month]
      }

      Ext.Date.monthNumbers = {
        'Jan': 0,
        'Feb': 1,
        'Mar': 2,
        'Apr': 3,
        'May': 4,
        'Jun': 5,
        'Jul': 6,
        'Aug': 7,
        'Sep': 8,
        'Okt': 9,
        'Nov': 10,
        'Dec': 11
      }

      Ext.Date.getMonthNumber = function (name) {
        return Ext.Date.monthNumbers[name.substring(0, 1).toUpperCase() + name.substring(1, 3).toLowerCase()]
      }

      Ext.Date.dayNames = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
      ]

      Ext.Date.getShortDayName = function (day) {
        return Ext.Date.dayNames[day].substring(0, 3)
      }
    }

    if (Ext.MessageBox) {
      Ext.MessageBox.buttonText = {
        ok: 'OK',
        yes: 'Yes',
        no: 'No',
        cancel: 'Cancel'
      }
      Ext.MessageBox.titleText = {
        confirm: 'Confirm',
        prompt: 'Prompt',
        wait: 'Loading...',
        alert: 'Attention'
      }
    }

    if (Ext.view.AbstractView) {
      Ext.view.AbstractView.prototype.loadingText = 'Loading...'
    }

    if (Ext.util.Format) {
      Ext.apply(Ext.util.Format, {
        dateFormat: 'm/d/Y',
        timeFormat: 'H:i:s',
        datetimeFormat: 'm/d/Y H:i',
        thousandSeparator: ' ',
        decimalSeparator: ',',
        currencySign: ''
      })
    }

    Ext.define('Ext.uk.ux.DateTimePicker', {
      override: 'Ext.ux.DateTimePicker',
      todayText: 'Now',
      timeLabel: 'Time'
    })

    if (Ext.picker.Date) {
      Ext.apply(Ext.picker.Date.prototype, {
        todayText: 'Today',
        minText: 'This date less than minimal date',
        maxText: 'This date greater than maximal date',
        disabledDaysText: '',
        disabledDatesText: '',
        monthNames: Ext.Date.monthNames,
        dayNames: Ext.Date.dayNames,
        nextText: 'Next month (Control+Right)',
        prevText: 'Previous month (Control+Left)',
        monthYearText: 'Choose month (Control+Up/Down for choosing year)',
        todayTip: '{0} (Space)',
        format: Ext.util.Format ? Ext.util.Format.dateFormat : 'm/d/Y',
        altFormats: 'dmY|dmy|d.m.y|d/m/Y|j/m/y|d/n/y|j/m/Y|d/n/Y|d-m-y|d/m|d-m|dm|dmy|dmY|d',
        startDay: 1
      })
    }

    if (Ext.picker.Month) {
      Ext.apply(Ext.picker.Month.prototype, {
        okText: '&#160;OK&#160;',
        cancelText: 'Cancel'
      })
    }

    if (Ext.toolbar.Paging) {
      Ext.apply(Ext.PagingToolbar.prototype, {
        beforePageText: 'Page',
        afterPageText: 'from {0}',
        firstText: 'First page',
        prevText: 'Previous page',
        nextText: 'Next page',
        lastText: 'Last page',
        refreshText: 'Refresh',
        displayMsg: 'Display rows from {0} to {1}, total {2}',
        emptyMsg: 'No data to display'
      })
    }

    if (Ext.form.field.Text) {
      Ext.apply(Ext.form.field.Text.prototype, {
        minLengthText: 'Minimum length of this field is {0}',
        maxLengthText: 'Maximum length of this field is {0}',
        blankText: 'This is required field',
        regexText: '',
        emptyText: null
      })
    }

    if (Ext.form.field.Number) {
      Ext.apply(Ext.form.field.Number.prototype, {
        minText: 'Field value cannot be less than {0}',
        maxText: 'Field value cannot be greater than {0}',
        nanText: '{0} is not a number'
      })
    }

    if (Ext.form.field.Date) {
      Ext.apply(Ext.form.field.Date.prototype, {
        disabledDaysText: 'Not accessible',
        disabledDatesText: 'Not accessible',
        minText: 'Date in this field must be greater then {0}',
        maxText: 'Date in this field must be less then {0}',
        invalidText: '{0} is not a correct. Date must be in format {1}',
        format: Ext.util.Format ? Ext.util.Format.dateFormat : 'm/d/Y',
        startDay: 1,
        altFormats: 'dmY|dmy|d.m.y|d/m/Y|j/m/y|d/n/y|j/m/Y|d/n/Y|d-m-y|d/m|d-m|dm|dmy|dmY|d'
      })
    }

    if (Ext.form.field.ComboBox) {
      Ext.apply(Ext.form.field.ComboBox.prototype, {
        valueNotFoundText: undefined
      })
      Ext.apply(Ext.form.field.ComboBox.prototype.defaultListConfig, {
        loadingText: 'Loading...'
      })
    }

    if (Ext.form.field.VTypes) {
      Ext.apply(Ext.form.field.VTypes, {
        emailText: 'This field must contains email address in format "user@example.com"',
        urlText: 'This field must contains email address URL in format "http:/' + '/www.example.com"',
        alphaText: 'This field must contains only latin letters and underscore character "_"',
        alphanumText: 'This field must contains only latin letters, digits and underscore character "_"'
      })
    }

    if (Ext.form.field.HtmlEditor) {
      Ext.apply(Ext.form.field.HtmlEditor.prototype, {
        createLinkText: 'Please, enter address:',
        buttonTips: {
          bold: {
            title: 'Bold (Ctrl+B)',
            text: 'Applying of boldface to selected text.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          italic: {
            title: 'Italic (Ctrl+I)',
            text: 'Applying of italic style to selected text.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          underline: {
            title: 'Underline (Ctrl+U)',
            text: 'Underline the selected text',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          increasefontsize: {
            title: 'Increase size',
            text: 'Increase font size.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          decreasefontsize: {
            title: 'Decrease size',
            text: 'Decrease font size.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          backcolor: {
            title: 'Backcolor',
            text: 'Change the background color for the selected text or paragraph.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          forecolor: {
            title: 'Forecolor',
            text: 'Change the foreground color for the selected text or paragraph.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          justifyleft: {
            title: 'Justify left',
            text: 'Justify text to the left.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          justifycenter: {
            title: 'Justify center',
            text: 'Justify text to the center.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          justifyright: {
            title: 'Justify right',
            text: 'Justify text to the right.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          insertunorderedlist: {
            title: 'Bullets',
            text: 'Start bullet list.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          insertorderedlist: {
            title: 'Numbering',
            text: 'Start numbering list.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          createlink: {
            title: 'Insert hyperlink',
            text: 'Create a hyperlink from selected text.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          sourceedit: {
            title: 'Source code',
            text: 'Switch to the source code.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          }
        }
      })
    }

    if (Ext.grid.header.Container) {
      Ext.apply(Ext.grid.header.Container.prototype, {
        sortAscText: 'Sort ascending',
        sortDescText: 'Sort descending',
        lockText: 'Freeze column',
        unlockText: 'Remove the frozen column',
        columnsText: 'Columns'
      })
    }

    if (Ext.grid.feature.Grouping) {
      Ext.apply(Ext.grid.feature.Grouping.prototype, {
        emptyGroupText: '(Empty)',
        groupByText: 'Group by this field',
        showGroupsText: 'Show by groups'
      })
    }

    if (Ext.grid.PropertyColumnModel) {
      Ext.apply(Ext.grid.PropertyColumnModel.prototype, {
        nameText: 'Name',
        valueText: 'Value',
        dateFormat: 'd.m.Y'
      })
    }

    if (Ext.SplitLayoutRegion) {
      Ext.apply(Ext.SplitLayoutRegion.prototype, {
        splitTip: 'Drag for changing the size.',
        collapsibleSplitTip: 'Drag for changing the size. Double click will hide the panel.'
      })
    }

    if (Ext.layout.BorderLayout && Ext.layout.BorderLayout.SplitRegion) {
      Ext.apply(Ext.layout.BorderLayout.SplitRegion.prototype, {
        splitTip: 'Drag for changing the size.',
        collapsibleSplitTip: 'Drag for changing the size. Double click will hide the panel.'
      })
    }

    if (Ext.form.CheckboxGroup) {
      Ext.apply(Ext.form.CheckboxGroup.prototype, {
        blankText: 'Please select at least one item in the group'
      })
    }

    if (Ext.tab.Tab) {
      Ext.apply(Ext.tab.Tab.prototype, {
        closeText: 'Close tab'
      })
    }

    if (Ext.form.Basic) {
      Ext.form.Basic.prototype.waitTitle = 'Please wait...'
    }
  })
}
