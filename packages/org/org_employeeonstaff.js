const UB = require('@unitybase/ub')
const App = UB.App
/* global org_employeeonstaff TubDataStore */
// eslint-disable-next-line camelcase
const me = org_employeeonstaff

me.on('update:before', assignCaptions)
me.on('update:after', doAfterUpdate)
me.on('insert:before', assignCaptions)
me.on('insert:after', doAfterInsert)
me.on('delete:after', doAfterDelete)
me.entity.addMethod('updatePendingStaffUnitCaptions')

/**
 * Updates all  multilingual captions for org_staffunit
 * @method updatestaffunitcaption
 * @memberOf org_employeeonstaff_ns.prototype
 * @memberOfModule @unitybase/org
 * @param {Number} staffUnitID
 */
me.updatestaffunitcaption = function (staffUnitID) {
  const staffUnit = UB.DataStore('org_staffunit')
  let updParams = {
    ID: staffUnitID,
    ['caption_' + App.defaultLang + '^']: ''
  }
  staffUnit.run('update', {
    fieldList: [],
    caller: me.entity.name,
    execParams: updParams,
    __skipOptimisticLock: true
  })
}

/**
 * Sets properly values for org_staffunit.captions. Can be called from scheduler
 * @method updatePendingStaffUnitCaptions
 * @memberOf org_employeeonstaff_ns.prototype
 * @memberOfModule @unitybase/org
 * @published
 */
me.updatePendingStaffUnitCaptions = function () {
  console.log('** updatePendingStaffUnitCaptions started')
  const pendingStoreName = me.entity.name + '_pending'
  let pendingStore = UB.Repository(pendingStoreName)
    .attrs(['ID', 'startDate', 'endDate', 'emponstaffID', 'emponstaffID.staffUnitID'])
    .orderBy('endDate')
    .select()

  if (pendingStore.eof) return

  let now = new Date()
  let updatedStaffUnitIDs = []

  App.dbCommit()
  let storeForDelelion = UB.DataStore(pendingStoreName)
  while (!pendingStore.eof) {
    let sDate = new Date(pendingStore.get('startDate'))
    let eDate = new Date(pendingStore.get('endDate'))
    let staffUnitID = pendingStore.get('emponstaffID.staffUnitID')
    try {
      if ((sDate <= now || eDate <= now) &&
        updatedStaffUnitIDs.indexOf(staffUnitID) === -1) {
        updatedStaffUnitIDs.push(staffUnitID)
        me.updatestaffunitcaption(staffUnitID)
      }
    } catch (err) {
      App.dbRollback()
      console.error(err)
    }
    if (sDate <= now && (eDate < now || eDate.getFullYear() > 5000)) {
      storeForDelelion.run('delete', {
        fieldList: [],
        execParams: {ID: pendingStore.get('ID')},
        __skipOptimisticLock: true
      })
    }
    App.dbCommit()
    pendingStore.next()
  }
  console.log('** updatePendingStaffUnitCaptions ends')
}

me.checkActual = function (ctxt) {
  const execParams = ctxt.mParams.execParams
  let sDate = execParams.mi_dateFrom
  let eDate = execParams.mi_dateTo
  if (!sDate && !eDate) return false

  let now = new Date()
  if (!sDate || !eDate) {
    let currentRow = UB.Repository(me.entity.name).attrs(['mi_dateFrom', 'mi_dateTo'])
      .where('ID', '=', execParams.ID).misc({__mip_recordhistory_all: true}).select()
    sDate = sDate || currentRow.get('mi_dateFrom')
    eDate = eDate || currentRow.get('mi_dateTo')
  }
  if (sDate > now || (eDate && (new Date(eDate).getFullYear() < 3000))) {
    const pendingStore = UB.DataStore(me.entity.name + '_pending')
    let pendingRow = UB.Repository(me.entity.name + '_pending')
      .attrs(['ID', 'startDate', 'endDate'])
      .where('emponstaffID', '=', execParams.ID).select()
    if (!pendingRow.rowCount) {
      pendingStore.run('insert', {
        fieldList: [],
        execParams: {
          ID: pendingStore.generateID(),
          emponstaffID: execParams.ID,
          startDate: sDate,
          endDate: eDate
        },
        __skipOptimisticLock: true
      })
    } else if (sDate !== pendingRow.get('startDate') || eDate !== pendingRow.get('endDate')) {
      pendingStore.run('update', {
        fieldList: [],
        execParams: {
          ID: pendingRow.get('ID'),
          emponstaffID: execParams.ID,
          startDate: sDate,
          endDate: eDate
        },
        __skipOptimisticLock: true
      })
    }
  }
}

/**
 * Updates all  multilingual captions for org_staffunit
 * @private
 * @param {ubMethodParams} ctxt
 */
function doAfterUpdate (ctxt) {
  const params = ctxt.mParams
  const execParams = params.execParams
  const staffUnitID = execParams.staffUnitID
  me.checkActual(ctxt)
  if (params.caller !== 'org_staffunit') {
    let store = ctxt.dataStore
    let dataName = store.currentDataName
    store.currentDataName = TubDataStore.DATA_NAMES.BEFORE_UPDATE
    let oldStaffUnitID = store.get('staffUnitID') || execParams.staffUnitID
    store.currentDataName = dataName
    if (staffUnitID) {
      me.updatestaffunitcaption(staffUnitID)
    }
    if (staffUnitID !== oldStaffUnitID) {
      me.updatestaffunitcaption(oldStaffUnitID)
    }
  }
}

/**
 * Updates all  multilingual captions for org_staffunit
 * @private
 * @param {ubMethodParams} ctxt
 */
function doAfterDelete (ctxt) {
  let store = ctxt.dataStore
  let dataName = store.currentDataName
  store.currentDataName = TubDataStore.DATA_NAMES.BEFORE_DELETE
  let staffUnitID = store.get('staffUnitID')
  store.currentDataName = dataName
  me.updatestaffunitcaption(staffUnitID)
}

/**
 * Updates all  multilingual captions for org_staffunit
 * @private
 * @param {ubMethodParams} ctxt
 */
function doAfterInsert (ctxt) {
  me.checkActual(ctxt)
  me.updatestaffunitcaption(ctxt.mParams.execParams.staffUnitID)
}

/**
 * Assigns properly values for all multilingual captions to execParams before insert or update
 * @private
 * @param {ubMethodParams} ctxt
 */
function assignCaptions (ctxt) {
  const execParams = ctxt.mParams.execParams

  let { staffUnitID, tabNo, employeeID, employeeOnStaffType } = execParams
  if (!tabNo || !staffUnitID || !employeeID || !employeeOnStaffType) {
    let currentRow = UB.Repository(me.entity.name)
      .attrs(['tabNo', 'staffUnitID', 'employeeID', 'employeeOnStaffType'])
      .where('[ID]', '=', execParams.ID).selectSingle()
    if (!currentRow) return
    employeeID = employeeID || currentRow.employeeID
    tabNo = tabNo || currentRow.tabNo
    staffUnitID = staffUnitID || currentRow.staffUnitID
    employeeOnStaffType = employeeOnStaffType || currentRow.employeeOnStaffType
  }
  const supportedLangs = me.entity.connectionConfig.supportLang
  let depFieldList = []
  let empFieldList = []
  let eosTypeFieldList = []
  supportedLangs.forEach(function (lang) {
    let suffix = '_' + lang + '^'
    eosTypeFieldList.push('name' + suffix)
    depFieldList.push('parentID.caption' + suffix)
    empFieldList.push('shortFIO' + suffix)
    empFieldList.push('lastName' + suffix)
  })
  let eosTypeInfo
  if (employeeOnStaffType !== 'PERMANENT') {
    eosTypeInfo = UB.Repository('ubm_enum')
      .attrs(eosTypeFieldList).where('eGroup', '=', 'CDN_EMPLOYEEONSTAFFTYPE')
      .where('code', '=', employeeOnStaffType)
      .limit(1).selectSingle()
  }

  let depInfo = UB.Repository('org_staffunit').attrs(depFieldList).selectById(staffUnitID)
  let employeeInfo = UB.Repository('org_employee').attrs(empFieldList).selectById(employeeID)
  supportedLangs.forEach(function (lang) {
    let suffix = '_' + lang + '^'
    let empName = employeeInfo['shortFIO' + suffix]
    let depName = depInfo['parentID.caption' + suffix]
    let eosType = ''
    if (eosTypeInfo) {
      eosType = ' - (' + eosTypeInfo['name' + suffix] + ')'
    }
    execParams['caption' + suffix] = empName + ' (' + tabNo + ',' + depName + ')' + eosType
  })
}
