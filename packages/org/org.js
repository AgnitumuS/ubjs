const _ = require('lodash')
const UB = require('@unitybase/ub')
const Session = UB.Session
const UBA_COMMON = require('@unitybase/base').uba_common

const ORG = UB.ns('ORG')
ORG.checkOrgUnitRequired = true
Session.on('login', orgOnUserLogin)

/**
 * For a superuser (UBA_COMMON.isSuperUser) all org related values are sets to '' or 0 (for IDs).
 *
 * Session 'login' event occurs every time when new user logs in.
 * Here we define logged-in user's FullName from org structure,
 * and array of org_unit IDs current user participates in.
 * This array is used in org structure-based RLS.
 *
 * We put the user's FullName and array of org_unit IDs
 * in Session.uData - only one session-depended server object
 * @private
 */
function orgOnUserLogin () {
  console.debug('Call JS method: ORG.onUserLogin')
  let data = Session.uData
  let staffs = null
  let orgUnitIDs = []
  let tmpArr = []
  let lastError = ''
  // Initializing with empty values
  data.staffUnitID = 0
  data.employeeOnStaffID = 0
  data.parentID = 0
  data.parentUnityEntity = ''
  data.orgUnitIDs = ''
  data.tempStaffUnitIDs = ''
  data.tempEmployeeOnStaffIDs = ''
  data.assistantStaffUnitIDs = ''
  data.assistantEmployeeOnStaffIDs = ''
  data.allStaffUnitIDs = ''
  data.allEmployeeOnStaffIDs = ''
  data.tempPositions = ''
  data.allPositions = ''

  try {
    staffs = UB.Repository('org_employeeonstaff')
      .attrs(['ID', 'employeeOnStaffType', 'description', 'employeeID.userID', 'employeeID.shortFIO',
        'employeeID.fullFIO', 'staffUnitID.ID.mi_treePath', 'staffUnitID.parentID',
        'staffUnitID.parentID.mi_unityEntity', 'staffUnitID', 'staffUnitID.fullName',
        'staffUnitID.name', 'employeeID', 'employeeID.mi_deleteDate'])
      .where('[employeeID.userID]', '=', Session.userID)
      .selectAsObject()
    // remove staffs for deleted org_employee,
    // because situation when org_employee for userID is deleted but org_employeeonstaff not is possible
    let delDate = new Date(2100, 1, 1)
    staffs = staffs.filter(s => new Date(s['employeeID.mi_deleteDate']) > delDate)
  } catch (ex) {
    // this possible if we connect to empty database without org_* tables
    staffs = []
    lastError = ex.toString()
    console.error('error getting org_employee', lastError)
  }

  if (!staffs.length) {
    // allow anonymous login only for SUPERUSER (before @unitybase/org@5.3 - a member of admin group)
    if (ORG.checkOrgUnitRequired && !UBA_COMMON.isSuperUser() && !Session.uData.roleIDs.includes(UBA_COMMON.ROLES.ADMIN.ID)) {
      throw new UB.UBAbort('<<<UserWithoutOrgEmployeeNotAllowed>>>')
    } else {
      // defined by ub model data.employeeShortFIO = ''
      data['orgUnitIDs'] = ''
      data.staffUnitID = -1
      data.employeeID = -1
    }
  } else {
    let permStaffUnitIDsArray = []
    let tempStaffUnitIDsArray = []
    let allStaffUnitIDsArray = []
    let tempEmployeeOnStaffIDsArray = []
    let tempPositionsArray = []
    let assistantStaffUnitIDsArray = []
    let assistantEmployeeOnStaffIDsArray = []
    let assistantPositionsArray = []
    let staffUnitID = null
    let employeeOnStaffID = null
    let parentID = null
    let parentUnityEntity = null
    let employeeOnStaffType = ''
    let permanentOrgUnitIDs = []

    let firstStaff = staffs[0]
    data.employeeShortFIO = firstStaff['employeeID.shortFIO']
    data.employeeFullFIO = firstStaff['employeeID.fullFIO']
    data.employeeID = firstStaff['employeeID']

    for (let i = 0, L = staffs.length; i < L; i++) {
      let staff = staffs[i]
      // treePath is something like this: "/2100002161511/2100002322780/" remove empty ""
      tmpArr = staff['staffUnitID.ID.mi_treePath'].split('/').filter(v => !!v).map(v => parseInt(v, 10))
      // drop STAFF type org units from orgUnitIDs array (see [UB-1571] for details)
      let myOU = tmpArr.pop() // last entry in treePath is my staff, so memorise it
      // select orgUnit types
      let orgUnitTypes = UB.Repository('org_unit').attrs(['ID', 'unitType']).where('ID', 'in', tmpArr).orderBy('mi_treePath').selectAsObject()
      tmpArr = []
      orgUnitTypes.forEach(function (unit) {
        if (unit.unitType !== 'STAFF') {
          tmpArr.push(unit.ID)
        }
      })
      tmpArr.push(myOU)

      orgUnitIDs = _.union(orgUnitIDs, tmpArr)
      employeeOnStaffType = staff['employeeOnStaffType']

      let currStaffUnitID = staff['staffUnitID']
      allStaffUnitIDsArray.push(currStaffUnitID)
      let currEmployeeOnStaffID = staff['ID']
      if (employeeOnStaffType === 'PERMANENT') {
        staffUnitID = currStaffUnitID // permanentStaffUnit
        employeeOnStaffID = currEmployeeOnStaffID // permanent employeeOnStaff
        parentID = staff['staffUnitID.parentID']
        parentUnityEntity = staff['staffUnitID.parentID.mi_unityEntity']
        permStaffUnitIDsArray.push(staffUnitID)
        data.staffUnitFullName = staff['staffUnitID.fullName']
        data.staffUnitName = staff['staffUnitID.name']
        permanentOrgUnitIDs = tmpArr
      } else if (employeeOnStaffType === 'TEMPORARY') {
        tempStaffUnitIDsArray.push(currStaffUnitID)
        tempEmployeeOnStaffIDsArray.push(currEmployeeOnStaffID)
        tempPositionsArray.push({
          staffUnitID: staff['staffUnitID'],
          employeeOnStaffID: staff['ID'],
          staffUnitFullName: staff['staffUnitID.fullName'],
          staffUnitName: staff['staffUnitID.name'],
          employeeOnStaffDescription: staff['description']
        })
      } else if (employeeOnStaffType === 'ASSISTANT') {
        assistantStaffUnitIDsArray.push(currStaffUnitID)
        assistantEmployeeOnStaffIDsArray.push(currEmployeeOnStaffID)
        assistantPositionsArray.push({
          staffUnitID: staff['staffUnitID'],
          employeeOnStaffID: staff['ID'],
          staffUnitFullName: staff['staffUnitID.fullName'],
          staffUnitName: staff['staffUnitID.name'],
          employeeOnStaffDescription: staff['description']
        })
      }
    }

    // Query exec groups obtained though all staff member IDs
    const execGroupIDs = UB.Repository('org_execgroupmember')
      .attrs('execGroupID')
      .where('orgUnitID', 'in', allStaffUnitIDsArray)
      .selectAsObject()
      .map(gm => gm.execGroupID)
    if (execGroupIDs.length > 0) {
      orgUnitIDs = _.union(orgUnitIDs, execGroupIDs)
    }

    if (permStaffUnitIDsArray.length > 1) {
      throw new UB.UBAbort(UB.i18n('errUserWithMultiplePermanentStaffUnitsNotAllowed'))
    }
    data.staffUnitID = staffUnitID // permanent staffUnitID
    data.employeeOnStaffID = employeeOnStaffID // permanent employeeOnStaffID
    data.parentID = parentID // permanent staffUnitID parent
    data.parentUnityEntity = parentUnityEntity // permanent staffUnitID parent entity type
    data['orgUnitIDs'] = orgUnitIDs.join(',') // all orgUnit's chain
    data['permanentOrgUnitIDs'] = permanentOrgUnitIDs.join(',') // user orgUnit's chain by permanent employeeOnStaffIDs
    data.tempStaffUnitIDs = tempStaffUnitIDsArray.join(',') // array of temporary staffUnitIDs
    data.tempEmployeeOnStaffIDs = tempEmployeeOnStaffIDsArray.join(',') // array of temporary employeeOnStaffIDs
    data.assistantStaffUnitIDs = assistantStaffUnitIDsArray.join(',') // array of assistant staffUnitIDs
    data.assistantEmployeeOnStaffIDs = assistantEmployeeOnStaffIDsArray.join(',') // array of assistant employeeOnStaffIDs
    tempEmployeeOnStaffIDsArray = _.union(tempEmployeeOnStaffIDsArray, assistantEmployeeOnStaffIDsArray)
    data.allStaffUnitIDs = allStaffUnitIDsArray.join(',') // array of all (permanent + temporary + assistant) staffUnitIDs
    tempEmployeeOnStaffIDsArray.push(employeeOnStaffID)
    data.allEmployeeOnStaffIDs = tempEmployeeOnStaffIDsArray.join(',') // array of all (permanent + temporary + assistant) employeeOnStaffIds
    data.tempPositions = JSON.stringify(tempPositionsArray) // stringified array of temporary position objects: {staffUnitID, employeeOnStaffID}
    data.assistantPositions = JSON.stringify(assistantPositionsArray) // stringified array of assistant position objects: {staffUnitID, employeeOnStaffID}
    tempPositionsArray = _.union(tempPositionsArray, assistantPositionsArray)
    tempPositionsArray.push({ staffUnitID: staffUnitID, employeeOnStaffID: employeeOnStaffID })
    data.allPositions = JSON.stringify(tempPositionsArray) // stringified array of permanent + temporary + assistant position objects: {staffUnitID, employeeOnStaffID}
  }
}
// expose onUserLogin to allow override it in other models
ORG.onUserLogin = orgOnUserLogin
