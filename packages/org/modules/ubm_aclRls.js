const { Session } = require('@unitybase/ub')
const ubaCommon = require('@unitybase/base').uba_common

/**
 * define methods for `ubm_desktop` and `ubm_navshortcut` to use then as the `exprMethod`
 * in the `aclRls` mixin. Additionally, this implementation checks access by org units
 */
global.ubm_desktop.getCurrentOrgUnitsAndAdminSubjects = getCurrentOrgUnitsAndAdminSubjects
global.ubm_navshortcut.getCurrentOrgUnitsAndAdminSubjects = getCurrentOrgUnitsAndAdminSubjects

function getCurrentOrgUnitsAndAdminSubjects (aclParams, aclRlsEntityName) {
  if (ubaCommon.isSuperUser() || Session.uData.roleIDs.includes(ubaCommon.ROLES.ADMIN.ID)) {
    return
  }

  const orgUnitsIDs = (Session.uData.orgUnitIDs || '').split(',').map(Number)
  const subjectIds = [Session.userID, ...Session.uData.roleIDs, ...Session.uData.groupIDs]

  aclParams.aclRlsResult = {
    entity: aclRlsEntityName,
    whereList: {
      byOwner: {
        expression: '[instanceID.mi_owner]',
        condition: 'equal',
        value: Session.userID
      },
      byValueID: {
        expression: '[valueID]',
        condition: 'in',
        value: [...subjectIds, ...orgUnitsIDs]
      }
    },
    logicalPredicates: '([byOwner] OR [byValueID])'
  }
}
