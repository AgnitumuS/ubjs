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

  const whereList = {
    byOwner: {
      expression: '[instanceID.mi_owner]',
      condition: 'equal',
      value: Session.userID
    },

    bySubject: {
      expression: '[subjID]',
      condition: 'in',
      value: [Session.userID, ...Session.uData.roleIDs, ...Session.uData.groupIDs]
    }
  }
  const logic = ['byOwner', 'bySubject']

  const orgUnitsIDs = (Session.uData.orgUnitIDs || '').split(',').map(Number)

  if (orgUnitsIDs.length > 0) {
    Object.assign(whereList, {
      byOrgUnits: {
        expression: '[ounitID]',
        condition: 'in',
        value: orgUnitsIDs
      }
    })
    logic.push('byOrgUnits')
  }

  aclParams.aclRlsResult = {
    entity: aclRlsEntityName,
    whereList,
    logicalPredicates: `(${logic.map(s => `[${s}]`).join(' OR ')})`
  }
}
