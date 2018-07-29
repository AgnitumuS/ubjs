const UB = require('@unitybase/ub')
const App = UB.App
/* global org_staffunit ubs_numcounter */
// eslint-disable-next-line camelcase
const me = org_staffunit

me.on('update:before', assignCaptions)
me.on('update:after', updateEmployeeOnStaffCaptions)
me.on('insert:before', generateCodeAndAssignCaption)
me.on('delete:before', checkUsed)

/**
 * Throw error in case assignments on the staff unit exists.
 * @private
 * @param {ubMethodParams} ctxt
 */
function checkUsed (ctxt) {
  let assigned = UB.Repository('org_employeeonstaff').attrs(['ID'])
    .where('[staffUnitID]', '=', ctxt.mParams.execParams.ID).selectSingle()
  if (assigned) {
    throw new UB.UBAbort(UB.i18n('errAlreadyAssigned'))
  }
}

const EMPLOYEEONSTAFF_STORE = UB.DataStore('org_employeeonstaff')
/**
 * Updates all  multilingual captions for org_employeeonstaff
 * @private
 * @param {ubMethodParams} ctxt
 */
function updateEmployeeOnStaffCaptions (ctxt) {
  const params = ctxt.mParams
  const execParams = params.execParams

  if (params.caller === 'org_employeeonstaff') return
  let onStaff = UB.Repository('org_employeeonstaff').attrs(['ID']).where('[staffUnitID]', '=', execParams.ID).select()
  if (onStaff.rowCount !== 0) {
    let updParams = {
      ['caption_' + App.defaultLang + '^']: ''
    }
    while (!onStaff.eof) {
      updParams.ID = onStaff.get(0)
      EMPLOYEEONSTAFF_STORE.run('update', {
        caller: me.entity.name,
        execParams: updParams,
        __skipOptimisticLock: true
      })
      onStaff.next()
    }
  }
}

/**
 * Sets properly values for all multilingual captions
 * @private
 * @param {ubMethodParams} ctxt
 */
function generateCodeAndAssignCaption (ctxt) {
  ubs_numcounter.generateAutoIncrementalCode(ctxt)
  assignCaptions(ctxt)
}

/**
 * Sets properly values for all multilingual captions in execParams before update or insert
 * @private
 * @param {ubMethodParams} ctxt
 */
function assignCaptions (ctxt) {
  const params = ctxt.mParams
  const execParams = params.execParams
  const ID = execParams.ID
  let orgUnitID = execParams.parentID
  let department = null
  let employeeList = {}
  let currentRow = {}
  const defaultSuffix = '_' + App.defaultLang + '^'
  const sLang = me.entity.connectionConfig.supportLang
  let needLoadStaffUnitRow = false
  let depFieldList = []

  if (execParams.name) {
    execParams['name' + defaultSuffix] = execParams.name
    delete execParams.name
  }
  let staffUnitFieldList = ['parentID']
  sLang.forEach(function (lang) {
    let suffix = '_' + lang + '^'
    staffUnitFieldList.push('name' + suffix)
    depFieldList.push('caption' + suffix)
    if (!orgUnitID) {
      staffUnitFieldList.push('parentID.caption' + suffix)
    }
    if (!execParams['name' + suffix]) {
      if (params.method === 'insert') {
        execParams['name' + suffix] = execParams['name' + defaultSuffix]
      } else {
        needLoadStaffUnitRow = true
      }
    }
    employeeList[lang] = null
  })
  if (orgUnitID) {
    department = UB.Repository('org_unit').attrs(depFieldList).selectById(orgUnitID)
  }
  if (needLoadStaffUnitRow || !orgUnitID) {
    currentRow = UB.Repository(me.entity.name).attrs(staffUnitFieldList).selectById(ID)
  }
  if (params.method !== 'insert') {
    employeeList = getEmployeeList(ID, sLang)
  }
  sLang.forEach(function (lang) {
    let suffix = '_' + lang + '^'
    let depName = department ? department['caption' + suffix] : currentRow['parentID.caption' + suffix]
    let staffUnitName = execParams['name' + suffix] || currentRow['name' + suffix]
    execParams['caption' + suffix] = (employeeList[lang] || UB.i18n('notAssigned', lang)) +
      ' (' + depName + ' ' + staffUnitName + ')'
  })
  delete execParams.caption
}

/**
 * Makes the object with list of assigned employees on this staff unit for all supported languages:
 * {
 *  'UK': 'Пупсіков,Феоктістов',
 *  'EN': 'Pupsikov,Feoktistov',
 *  'RU': 'Пупсиков,Феоктистов'
 * }
 * @private
 * @param {Number} staffUnitID
 * @param {Array} supportLang
 * @return {Object}
 */
function getEmployeeList (staffUnitID, supportLang) {
  let staffsFieldList = ['employeeOnStaffType']
  let result = {}
  supportLang.forEach(function (lang) {
    let suffix = '_' + lang + '^'
    staffsFieldList.push('employeeID.shortFIO' + suffix)
    staffsFieldList.push('employeeID.lastName' + suffix)
    result[lang] = null
  })
  if (!staffUnitID) {
    return result
  }
  let staffs = UB.Repository('org_employeeonstaff').attrs(staffsFieldList)
    .where('[employeeOnStaffType]', 'in', ['PERMANENT', 'TEMPORARY'])
    .where('[staffUnitID]', '=', staffUnitID)
    .orderBy('[employeeOnStaffType]').select()
  let staffsCount = staffs.rowCount
  supportLang.forEach(function (lang) {
    let suffix = '_' + lang + '^'
    let employeeList = []
    staffs.first()
    while (!staffs.eof) {
      let staf = ((staffsCount > 1 && staffs.get('employeeOnStaffType') === 'PERMANENT') ? '* ' : '') +
        staffs.get('employeeID.shortFIO' + suffix)
      employeeList.push(staf)
      staffs.next()
    }
    result[lang] = employeeList.join(',')
  })
  return result
}
