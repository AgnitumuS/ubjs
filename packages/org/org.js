const _ = require('lodash')
// localize model
require('./serverLocale/org_i18n')
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

  if (UBA_COMMON.isSuperUser()) return

  try {
    staffs = UB.Repository('org_employeeonstaff')
      .attrs(['ID', 'employeeOnStaffType', 'description', 'employeeID.userID', 'employeeID.shortFIO',
        'employeeID.fullFIO', 'staffUnitID.ID.mi_treePath', 'staffUnitID.parentID',
        'staffUnitID.parentID.mi_unityEntity', 'staffUnitID', 'staffUnitID.fullName',
        'staffUnitID.name', 'employeeID'])
      .where('[employeeID.userID]', '=', Session.userID)
      .selectAsObject()
  } catch (ex) {
    // this possible if we connect to empty database without org_* tables
    lastError = ex.toString()
    console.error('error getting org_employee', lastError)
  }

  if (!staffs.length) {
    // allow anonymous login only for member of admin group (groupID = 1)
    if (ORG.checkOrgUnitRequired && (Session.uData.roleIDs.indexOf(UBA_COMMON.ROLES.ADMIN.ID) === -1)) {
      throw new UB.UBAbort('<<<UserWithoutOrgEmployeeNotAllowed>>>. ' + lastError)
    } else {
      data.employeeShortFIO = ''
      data['orgUnitIDs'] = ''
      data.staffUnitID = -1
      data.employeeID = -1
    }
  } else {
    let permStaffUnitIDsArray = []
    let tempStaffUnitIDsArray = []
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
    let currPositionObj, currStaffUnitID, currEmployeeOnStaffID

    let firstStaff = staffs[0]
    data.employeeShortFIO = firstStaff['employeeID.shortFIO']
    data.employeeFullFIO = firstStaff['employeeID.fullFIO']
    data.employeeID = firstStaff['employeeID']

    for (let i = 0, L = staffs.length; i < L; i++) {
      let staff = staffs[i]
      // treePath is something like this: "/2100002161511/2100002322780/" remove empty ""
      tmpArr = _.without(staff['staffUnitID.ID.mi_treePath'].split('/'), '')
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

      if (employeeOnStaffType === 'PERMANENT') {
        staffUnitID = staff['staffUnitID'] // permanentStaffUnit
        employeeOnStaffID = staff['ID'] // permanent employeeOnStaff
        parentID = staff['staffUnitID.parentID']
        parentUnityEntity = staff['staffUnitID.parentID.mi_unityEntity']
        permStaffUnitIDsArray.push(staffUnitID)
        data.staffUnitFullName = staff['staffUnitID.fullName']
        data.staffUnitName = staff['staffUnitID.name']
        permanentOrgUnitIDs = tmpArr
      } else if (employeeOnStaffType === 'TEMPORARY') {
        currStaffUnitID = staff['staffUnitID']
        currEmployeeOnStaffID = staff['ID']
        tempStaffUnitIDsArray.push(currStaffUnitID)
        tempEmployeeOnStaffIDsArray.push(currEmployeeOnStaffID)
        currPositionObj = {
          staffUnitID: staff['staffUnitID'],
          employeeOnStaffID: staff['ID'],
          staffUnitFullName: staff['staffUnitID.fullName'],
          staffUnitName: staff['staffUnitID.name'],
          employeeOnStaffDescription: staff['description']
        }
        tempPositionsArray.push(currPositionObj)
      } else if (employeeOnStaffType === 'ASSISTANT') {
        currStaffUnitID = staff['staffUnitID']
        currEmployeeOnStaffID = staff['ID']
        assistantStaffUnitIDsArray.push(currStaffUnitID)
        assistantEmployeeOnStaffIDsArray.push(currEmployeeOnStaffID)
        currPositionObj = {
          staffUnitID: staff['staffUnitID'],
          employeeOnStaffID: staff['ID'],
          staffUnitFullName: staff['staffUnitID.fullName'],
          staffUnitName: staff['staffUnitID.name'],
          employeeOnStaffDescription: staff['description']
        }
        assistantPositionsArray.push(currPositionObj)
      }
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
    tempStaffUnitIDsArray = _.union(tempStaffUnitIDsArray, assistantStaffUnitIDsArray)
    tempStaffUnitIDsArray.push(staffUnitID)
    tempEmployeeOnStaffIDsArray = _.union(tempEmployeeOnStaffIDsArray, assistantEmployeeOnStaffIDsArray)
    data.allStaffUnitIDs = tempStaffUnitIDsArray.join(',') // array of all (permanent + temporary + assistant) staffUnitIDs
    tempEmployeeOnStaffIDsArray.push(employeeOnStaffID)
    data.allEmployeeOnStaffIDs = tempEmployeeOnStaffIDsArray.join(',') // array of all (permanent + temporary + assistant) employeeOnStaffIds
    data.tempPositions = JSON.stringify(tempPositionsArray) // stringified array ob temporary position objects: {staffUnitID, employeeOnStaffID}
    data.assistantPositions = JSON.stringify(assistantPositionsArray) // stringified array ob assistant position objects: {staffUnitID, employeeOnStaffID}
    tempPositionsArray = _.union(tempPositionsArray, assistantPositionsArray)
    tempPositionsArray.push({staffUnitID: staffUnitID, employeeOnStaffID: employeeOnStaffID})
    data.allPositions = JSON.stringify(tempPositionsArray) // stringified array of permanent + temporary + assistant position objects: {staffUnitID, employeeOnStaffID}
  }
}
ORG.onUserLogin = orgOnUserLogin
