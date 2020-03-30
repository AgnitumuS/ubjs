/* global Ext UB */
/*
This file is part UnityBase Ext-based client
Copyright (c) 2014 InBase
*/
/**
 * English translation
 */
UB.i18nExtend({
  doYouWantLogoutFromExternalServer: 'Завершить сессию в удостоверяющем центре?',
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
  id: 'Indonesia',
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
  notValidForColumns: "Invalid values in columns {0}",
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
  recordLockedOtherUser: 'The record locked other user',
  recordLockedThisUser: 'The record is already locked',
  lockSuccessCreated: 'The record is locked successfully',
  recordLockedByTempLock: 'The record now is edited by other user',
  recordLockedThisUserByTempLock: 'The record now is edited by current user',
  lockSuccessDeleted: 'The record is unlocked successfully',
  recordNotLocked: 'The record is not locked',
  tempLockExistForThisUser: 'The current user is currently editing an entry in another tab or window on another computer does',

  nodeTemplateNotFound: 'Cannot find template for node: {0} with node type: {1}',
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
  selectFromDictionary: 'Select from dictionary',
  clearSelection: 'Clear selection',
  isRequiredTip: 'It is required',
  isMultilangTip: 'Values for other languages',
  calcRowCount: 'Count the number of rows',
  totalRowCount: 'The total number of lines',

  isNull: 'Empty',
  by_value: 'Equal',
  by_several_value: 'Multiple',
  more: 'More',
  less: 'Less',
  equal: 'Equal',
  range: 'Range',
  contains: 'Contains',
  startWith: 'Starting with',
  attention: 'Attention',
  doNotSelectedConfigName: 'No configuration is selected',
  load: 'Load',
  save: 'Save',
  apply: 'Menerapkan',
  doNotSave: "Don't Save",
  fDelete: 'Delete',
  configurationName: 'Configuration',
  deleteConfirm: 'Do you really want to delete configuration?',
  filterWasChangedConfirm: 'Filter was changed. After loading the configuration, all changes will be lost. Continue?',
  filterIsRequired: 'The filter is required',

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
  recordNotExistsOrDontHaveRights: 'Record not exists or you don\'t have access rights',
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
  closeOther: 'Close all but this',
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
  'AsTable': 'AsTable',
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

  quickAccessButtons: 'Quick access buttons', // TO DO: locale

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
    if (Ext.util.Format) {
      Ext.apply(Ext.util.Format, {
        dateFormat: 'm/d/Y',
        timeFormat: 'H:i:s',
        datetimeFormat: 'm/d/Y H:i'
      })
    }
    Ext.define('Ext.uk.ux.DateTimePicker', {
      override: 'Ext.ux.DateTimePicker',
      todayText: 'Now',
      timeLabel: 'Time'
    })

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
  })
}
