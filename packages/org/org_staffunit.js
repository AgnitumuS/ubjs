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
  const assigned = UB.Repository('org_employeeonstaff').attrs(['ID'])
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
  const onStaff = UB.Repository('org_employeeonstaff').attrs(['ID']).where('[staffUnitID]', '=', execParams.ID).select()
  if (onStaff.rowCount !== 0) {
    const updParams = {
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
 * Sets caption for all languages in execParams before update or insert
 * @private
 * @param {ubMethodParams} ctxt
 */
function assignCaptions (ctxt) {
  const params = ctxt.mParams
  const execParams = params.execParams
  const ID = execParams.ID
  let parentID = execParams.parentID
  let parentOrgOrDep = null
  let employeeList = {}
  let currentRow = {}
  const defaultSuffix = '_' + App.defaultLang + '^'
  const sLang = me.entity.connectionConfig.supportLang
  let needLoadStaffUnitRow = false
  const parentFieldList = ['unitType', 'parentID']

  if (execParams.name) {
    execParams['name' + defaultSuffix] = execParams.name
    delete execParams.name
  }
  const staffUnitFieldList = ['parentID']
  sLang.forEach(function (lang) {
    const suffix = '_' + lang + '^'
    staffUnitFieldList.push('name' + suffix)
    parentFieldList.push('caption' + suffix)
    if (!parentID) {
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
  if (needLoadStaffUnitRow || !parentID) {
    currentRow = UB.Repository(me.entity.name).attrs(staffUnitFieldList).selectById(ID)
    parentID = currentRow.parentID
  }
  if (parentID) {
    parentOrgOrDep = UB.Repository('org_unit').attrs(parentFieldList).selectById(parentID)
    // search for first parent with type !== STAFF
    while (parentOrgOrDep && (parentOrgOrDep.unitType === 'STAFF') && parentOrgOrDep.parentID) {
      parentOrgOrDep = UB.Repository('org_unit').attrs(parentFieldList).selectById(parentOrgOrDep.parentID)
    }
    if (parentOrgOrDep && (parentOrgOrDep.unitType === 'STAFF')) {
      // STAFF is a top level tree element
      parentOrgOrDep = null
    }
  }

  if (params.method !== 'insert') {
    employeeList = getEmployeeList(ID, sLang)
  }
  sLang.forEach(function (lang) {
    const suffix = '_' + lang + '^'
    const depName = parentOrgOrDep
      ? parentOrgOrDep['caption' + suffix] + ' '
      : ''
    const staffUnitName = execParams['name' + suffix] || currentRow['name' + suffix]
    execParams['caption' + suffix] = (employeeList[lang] || UB.i18n('notAssigned', lang)) +
      ' (' + depName + staffUnitName + ')'
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
  const staffsFieldList = ['employeeOnStaffType']
  const result = {}
  supportLang.forEach(function (lang) {
    const suffix = '_' + lang + '^'
    staffsFieldList.push('employeeID.shortFIO' + suffix)
    staffsFieldList.push('employeeID.lastName' + suffix)
    result[lang] = null
  })
  if (!staffUnitID) {
    return result
  }
  const staffs = UB.Repository('org_employeeonstaff').attrs(staffsFieldList)
    .where('[employeeOnStaffType]', '<>', 'ASSISTANT') // skip assistant for staff unit caption
    .where('[staffUnitID]', '=', staffUnitID)
    .orderBy('[employeeOnStaffType]').select()
  const staffsCount = staffs.rowCount
  supportLang.forEach(function (lang) {
    const suffix = '_' + lang + '^'
    const employeeList = []
    staffs.first()
    while (!staffs.eof) {
      const staf = ((staffsCount > 1 && staffs.get('employeeOnStaffType') === 'PERMANENT') ? '* ' : '') +
        staffs.get('employeeID.shortFIO' + suffix)
      employeeList.push(staf)
      staffs.next()
    }
    result[lang] = employeeList.join(',')
  })
  return result
}
