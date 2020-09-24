const { Session } = require('@unitybase/ub')
const ubaCommon = require('@unitybase/base').uba_common

/**
 * define `getCurrentOrgUnitsAndAdminSubjects` method for `ubm_desktop` and `ubm_navshortcut`
 * in order to use new aclRsl exprMethod for them that includes checking by org units
 */
global.ubm_desktop.getCurrentOrgUnitsAndAdminSubjects = getCurrentOrgUnitsAndAdminSubjects
global.ubm_navshortcut.getCurrentOrgUnitsAndAdminSubjects = getCurrentOrgUnitsAndAdminSubjects

function getCurrentOrgUnitsAndAdminSubjects (aclParams, aclRlsEntityName) {
  if (ubaCommon.isSuperUser() || Session.uData.roleIDs.includes(ubaCommon.ROLES.ADMIN.ID)) {
    return
  }

  const orgUnitsIDs = (Session.uData.orgUnitIDs || '').split(',').map(Number)
  const valueIDs = [Session.userID, ...Session.uData.roleIDs, ...Session.uData.groupIDs, ...orgUnitsIDs]

  const whereList = {
    byOwner: {
      expression: '[instanceID.mi_owner]',
      condition: 'equal',
      value: Session.userID
    },

    byValueID: {
      expression: '[valueID]',
      condition: 'in',
      value: valueIDs
    }
  }

  aclParams.aclRlsResult = {
    entity: aclRlsEntityName,
    whereList,
    logicalPredicates: '([byOwner] OR [byValueID])'
  }
}
