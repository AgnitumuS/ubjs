const { Session } = require('@unitybase/ub')
const ubaCommon = require('@unitybase/base').uba_common

module.exports = {
  getCurrentAdminSubjects
}

function getCurrentAdminSubjects (aclParams, aclRlsEntityName) {
  if (ubaCommon.isSuperUser() || Session.uData.roleIDs.includes(ubaCommon.ROLES.ADMIN.ID)) {
    return
  }

  aclParams.aclRlsResult = {
    entity: aclRlsEntityName,
    whereList: {
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
    },
    logicalPredicates: ['([byOwner] OR [bySubject])']
  }
}
